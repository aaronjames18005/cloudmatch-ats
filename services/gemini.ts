
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Roadmap, ChatMessage } from "../types";

// Always use { apiKey: process.env.API_KEY } named parameter
// Creating a fresh instance inside functions is recommended for the latest environment state
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Robust JSON extraction that handles markdown, conversational prefixing, 
 * and model-specific formatting quirks.
 */
const parseGeminiResponse = (text: string | undefined): any => {
  if (!text || text.trim().length === 0) {
    throw new Error("Empty response from AI engine.");
  }
  
  let cleaned = text.trim();
  
  // 1. Remove markdown code block markers if present
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/g, "");
  cleaned = cleaned.replace(/^```\s*/i, "").replace(/\s*```$/g, "");

  // 2. Locate the actual JSON structure in case there's conversational prefix/suffix
  const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  try {
    const data = JSON.parse(cleaned);
    
    // Inject mission-critical defaults for AnalysisResult structure
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      if (typeof data.matchScore !== 'number') data.matchScore = parseInt(data.matchScore) || 0;
      if (!data.candidateName) data.candidateName = "Candidate Profile";
      
      // Ensure arrays exist to prevent UI crashes
      data.matchedSkills = data.matchedSkills || [];
      data.missingSkills = data.missingSkills || [];
      data.recommendations = data.recommendations || [];
      
      if (!data.industryBenchmarks) {
        data.industryBenchmarks = {
          averageScore: 65,
          topPercentileScore: 88,
          marketDemand: 'High',
          typicalCandidateYears: data.yearsExperience || 3
        };
      }
    }
    return data;
  } catch (e) {
    console.error("JSON Parse Error. Data tried to parse:", cleaned);
    throw new Error("The AI matching engine returned an invalid format. Please try again.");
  }
};

const cleanBase64 = (dataUrl: string) => {
  if (typeof dataUrl !== 'string') return "";
  if (!dataUrl.includes(',')) return dataUrl;
  return dataUrl.split(',')[1];
};

export const extractJobEntities = async (description: string): Promise<any[]> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Act as an expert Technical Recruiter. Analyze the following Job Description (JD) and extract all relevant professional skills.
      
      Rules for Extraction:
      1. 'Technical': Hard skills like languages, tools, or frameworks.
      2. 'Soft': Interpersonal skills.
      3. 'Domain': Industry-specific knowledge.
      
      JD: ${description}`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING, enum: ["Technical", "Soft", "Domain"] },
              importance: { type: Type.STRING, enum: ["Critical", "Nice-to-have"] }
            },
            required: ["name", "category", "importance"]
          }
        }
      }
    });
    return parseGeminiResponse(response.text);
  } catch (err) {
    console.error("NER extraction failed", err);
    return []; 
  }
};

export const analyzeResume = async (
  jobDescription: string,
  resumeInput: { mimeType: string; data: string } | string
): Promise<AnalysisResult> => {
  const ai = getAI();
  
  const instruction = `Analyze the resume against the job description. Provide a match score (0-100), identify matched/missing skills, and give career recommendations.`;

  let parts: any[] = [];
  if (typeof resumeInput === 'object') {
    parts = [
      { inlineData: { mimeType: resumeInput.mimeType, data: cleanBase64(resumeInput.data) } },
      { text: `JD: ${jobDescription}\n\nTASK: ${instruction}` }
    ];
  } else {
    parts = [{ text: `Resume: ${resumeInput}\n\nJD: ${jobDescription}\n\nTASK: ${instruction}` }];
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: { parts },
    config: { 
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          candidateName: { type: Type.STRING },
          matchScore: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          yearsExperience: { type: Type.NUMBER },
          matchedSkills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                category: { type: Type.STRING, enum: ["Technical", "Soft", "Domain"] },
                proficiency: { type: Type.STRING, enum: ["Beginner", "Intermediate", "Expert"] },
                importance: { type: Type.STRING, enum: ["Critical", "Nice-to-have"] }
              },
              required: ["name", "category", "proficiency", "importance"]
            }
          },
          missingSkills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                category: { type: Type.STRING, enum: ["Technical", "Soft", "Domain"] },
                importance: { type: Type.STRING, enum: ["Critical", "Nice-to-have"] }
              },
              required: ["name", "category", "importance"]
            }
          },
          resumeOnlySkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          industryBenchmarks: {
            type: Type.OBJECT,
            properties: {
              averageScore: { type: Type.NUMBER },
              topPercentileScore: { type: Type.NUMBER },
              marketDemand: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
              typicalCandidateYears: { type: Type.NUMBER }
            },
            required: ["averageScore", "topPercentileScore", "marketDemand", "typicalCandidateYears"]
          }
        },
        required: ["candidateName", "matchScore", "summary", "matchedSkills", "missingSkills", "recommendations", "yearsExperience", "industryBenchmarks"]
      }
    }
  });

  return parseGeminiResponse(response.text);
};

export const generateCareerRoadmap = async (
  jobTitle: string,
  analysis: AnalysisResult,
  interviewDate?: string,
  startDate?: string
): Promise<Roadmap> => {
  const ai = getAI();
  const prompt = `Create a detailed preparation roadmap for: ${jobTitle}. 
  Gaps to address: ${analysis.missingSkills.map(s => s.name).join(', ')}. 
  Target Date: ${interviewDate || 'ASAP'}.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: { 
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          jobTitle: { type: Type.STRING },
          mindMap: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING },
              category: { type: Type.STRING, enum: ["Core", "Tech", "Soft", "Domain"] },
              status: { type: Type.STRING, enum: ["acquired", "in-progress", "missing"] },
              children: { type: Type.ARRAY, items: { type: Type.OBJECT } } 
            },
            required: ["id", "label", "category", "status"]
          },
          phases: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                duration: { type: Type.STRING },
                description: { type: Type.STRING },
                goals: { type: Type.ARRAY, items: { type: Type.STRING } },
                tasks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                      timeEstimate: { type: Type.STRING },
                      status: { type: Type.STRING, enum: ["todo", "in-progress", "done"] },
                      category: { type: Type.STRING },
                      actionItems: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["id", "title", "description", "priority", "timeEstimate", "status"]
                  }
                }
              },
              required: ["id", "title", "duration", "description", "goals", "tasks"]
            }
          }
        },
        required: ["jobTitle", "mindMap", "phases"]
      }
    }
  });
  
  return parseGeminiResponse(response.text);
};

export const chatWithRoleCoach = async (
  currentHistory: ChatMessage[],
  newMessage: string,
  context: { jobTitle: string; analysis?: AnalysisResult }
): Promise<string> => {
  const ai = getAI();
  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are RoleCoach, an elite career mentor specializing in the ${context.jobTitle} role. Match score is ${context.analysis?.matchScore || 'unknown'}%. Address gaps like ${context.analysis?.missingSkills.map(s => s.name).slice(0, 3).join(', ') || 'technical weaknesses'}.`,
      },
      history: currentHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
    });
    const response = await chat.sendMessage({ message: newMessage });
    return response.text || "I'm processing that. One moment.";
  } catch (err) {
    console.error("Chat error", err);
    return "I hit a snag. Try asking something else about your career roadmap.";
  }
};
