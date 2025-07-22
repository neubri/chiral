const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiHelper {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async explainText(highlightedText, context = null) {
    try {
      const prompt = `
        Jelaskan kata/kalimat "${highlightedText}" dengan sangat sederhana dan ringkas.
        ${context ? `Konteks: "${context}"` : ""}

        ATURAN PENTING:
        - MAKSIMAL 1-2 paragraf pendek
        - Gunakan analogi sederhana yang relatable
        - Fokus HANYA pada makna inti dari kata/kalimat tersebut
        - Bahasa Indonesia yang mudah dipahami anak SMP
        - Langsung to the point, jangan bertele-tele
        - Berikan 1 contoh konkret yang familiar

        Jawab dengan format: "Definisi singkat + analogi sederhana + contoh konkret"
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to generate explanation");
    }
  }

  async generateLearningPath(topic, currentLevel = "pemula") {
    try {
      const prompt = `
        Buat rencana belajar untuk topik "${topic}" level ${currentLevel}.

        ATURAN:
        - Maksimal 4 langkah pembelajaran
        - Setiap langkah ringkas dan actionable
        - Estimasi waktu realistis
        - Sumber belajar yang mudah diakses

        Format JSON:
        {
          "learningPath": [
            {
              "step": 1,
              "title": "Judul singkat",
              "description": "Deskripsi singkat (1-2 kalimat)",
              "resources": ["sumber 1", "sumber 2"]
            }
          ],
          "keyTopics": ["maksimal 4 topik kunci"],
          "estimatedTime": "estimasi total waktu",
          "prerequisites": ["prasyarat jika ada"]
        }

        Gunakan bahasa Indonesia dan fokus pada hal-hal esensial saja.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const suggestions = response.text();

      try {
        return JSON.parse(suggestions);
      } catch (parseError) {
        return {
          topic,
          suggestions,
          format: "text",
        };
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to generate learning suggestions");
    }
  }

  async generateQuiz(content, difficulty = "easy") {
    try {
      const prompt = `
        Buat 3 soal pilihan ganda berdasarkan konten ini dengan tingkat ${difficulty}.

        Konten: "${content.substring(0, 800)}..."

        ATURAN:
        - Hanya 3 soal saja (jangan overwhelm user)
        - Pertanyaan singkat dan jelas
        - Penjelasan jawaban maksimal 1 kalimat
        - Fokus pada poin-poin penting dari konten

        Format JSON:
        {
          "questions": [
            {
              "question": "Pertanyaan singkat?",
              "options": ["A. Pilihan 1", "B. Pilihan 2", "C. Pilihan 3", "D. Pilihan 4"],
              "correctAnswer": "A",
              "explanation": "Penjelasan singkat (1 kalimat)"
            }
          ]
        }

        Gunakan bahasa Indonesia.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const quiz = response.text();

      try {
        return JSON.parse(quiz);
      } catch (parseError) {
        return {
          content: content.substring(0, 100) + "...",
          quiz,
          format: "text",
        };
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to generate quiz");
    }
  }

  async summarizeContent(content, length = "medium") {
    try {
      const lengthMap = {
        short: "1 paragraf pendek",
        medium: "1-2 paragraf",
        long: "2-3 paragraf",
      };

      const prompt = `
        Buat ringkasan artikel ini dalam ${lengthMap[length] || "1-2 paragraf"}.

        Artikel: "${content}"

        ATURAN:
        - Fokus pada poin utama saja
        - Bahasa sederhana dan jelas
        - Langsung to the point
        - Sertakan 1-2 insight penting
        - Jangan terlalu detail, cukup inti sari

        Gunakan bahasa Indonesia yang mudah dipahami.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text();

      return {
        originalLength: content.length,
        summary,
        summaryLength: summary.length,
        compressionRatio: Math.round(
          (1 - summary.length / content.length) * 100
        ),
      };
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to generate summary");
    }
  }
}

module.exports = new GeminiHelper();
