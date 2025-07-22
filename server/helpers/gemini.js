const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiHelper {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async explainText(highlightedText, context = null) {
    try {
      const prompt = `
        Jelaskan kata atau kalimat berikut dengan bahasa yang sangat sederhana seperti menjelaskan kepada anak usia 13 tahun.
        Gunakan analogi dan contoh yang mudah dipahami. Jangan gunakan jargon teknis yang rumit.

        Kata/Kalimat yang perlu dijelaskan: "${highlightedText}"

        ${context ? `Konteks: "${context}"` : ""}

        Berikan penjelasan yang:
        1. Mudah dipahami
        2. Menggunakan analogi sederhana
        3. Memberikan contoh praktis
        4. Maksimal 3 paragraf
        5. Dalam bahasa Indonesia
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
        Berikan saran pembelajaran untuk topik "${topic}" dengan level ${currentLevel}.

        Berikan dalam format JSON dengan struktur:
        {
          "learningPath": [
            {
              "step": 1,
              "title": "Judul langkah",
              "description": "Deskripsi apa yang harus dipelajari",
              "resources": ["sumber belajar 1", "sumber belajar 2"]
            }
          ],
          "keyTopics": ["topik kunci 1", "topik kunci 2"],
          "estimatedTime": "estimasi waktu belajar",
          "prerequisites": ["prasyarat jika ada"]
        }

        Berikan maksimal 5 langkah pembelajaran yang terstruktur dan mudah diikuti.
        Gunakan bahasa Indonesia.
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
        Berdasarkan konten berikut, buat 5 soal pilihan ganda dengan tingkat kesulitan ${difficulty}.

        Konten: "${content.substring(0, 1000)}..."

        Format JSON:
        {
          "questions": [
            {
              "question": "Pertanyaan",
              "options": ["A. Pilihan 1", "B. Pilihan 2", "C. Pilihan 3", "D. Pilihan 4"],
              "correctAnswer": "A",
              "explanation": "Penjelasan kenapa jawaban ini benar"
            }
          ]
        }

        Gunakan bahasa Indonesia dan pastikan soal relevan dengan konten.
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
        short: "1 paragraf",
        medium: "2-3 paragraf",
        long: "4-5 paragraf",
      };

      const prompt = `
        Buatlah ringkasan dari artikel berikut dalam ${
          lengthMap[length] || "2-3 paragraf"
        }.

        Artikel: "${content}"

        Ringkasan harus:
        1. Mencakup poin-poin utama
        2. Mudah dipahami
        3. Menggunakan bahasa sederhana
        4. Dalam bahasa Indonesia
        5. Menyertakan insight atau pembelajaran penting
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
