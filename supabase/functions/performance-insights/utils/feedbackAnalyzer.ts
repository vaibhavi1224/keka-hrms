
interface FeedbackRecord {
  feedback_type: string;
  feedback_text: string;
  rating?: number;
  review_period_start: string;
  review_period_end: string;
}

interface SentimentAnalysis {
  overallSentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  keyThemes: string[];
  strengths: string[];
  improvements: string[];
  averageRating: number;
}

export function analyzeFeedbackSentiment(feedback: FeedbackRecord[]): SentimentAnalysis {
  if (feedback.length === 0) {
    return {
      overallSentiment: 'neutral',
      sentimentScore: 0,
      keyThemes: [],
      strengths: [],
      improvements: [],
      averageRating: 0
    };
  }

  // Calculate average rating
  const ratingsAvailable = feedback.filter(f => f.rating !== null && f.rating !== undefined);
  const averageRating = ratingsAvailable.length > 0 
    ? ratingsAvailable.reduce((sum, f) => sum + (f.rating || 0), 0) / ratingsAvailable.length
    : 0;

  // Analyze text sentiment using simple keyword-based approach
  const sentimentAnalysis = analyzeTextSentiment(feedback.map(f => f.feedback_text));
  
  // Extract themes and insights
  const themes = extractKeyThemes(feedback);
  const strengths = extractStrengths(feedback);
  const improvements = extractImprovements(feedback);

  return {
    overallSentiment: sentimentAnalysis.sentiment,
    sentimentScore: sentimentAnalysis.score,
    keyThemes: themes,
    strengths,
    improvements,
    averageRating: Math.round(averageRating * 10) / 10
  };
}

function analyzeTextSentiment(texts: string[]): { sentiment: 'positive' | 'neutral' | 'negative'; score: number } {
  const positiveWords = [
    'excellent', 'outstanding', 'great', 'good', 'amazing', 'fantastic', 'wonderful',
    'impressive', 'strong', 'effective', 'skilled', 'talented', 'dedicated', 
    'reliable', 'consistent', 'proactive', 'innovative', 'collaborative'
  ];

  const negativeWords = [
    'poor', 'bad', 'terrible', 'awful', 'disappointing', 'weak', 'ineffective',
    'unreliable', 'inconsistent', 'lacking', 'needs improvement', 'struggling',
    'difficult', 'challenging', 'issues', 'problems', 'concerns'
  ];

  let positiveCount = 0;
  let negativeCount = 0;
  let totalWords = 0;

  texts.forEach(text => {
    const words = text.toLowerCase().split(/\s+/);
    totalWords += words.length;

    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
      if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
    });
  });

  const netSentiment = positiveCount - negativeCount;
  const score = totalWords > 0 ? (netSentiment / totalWords) * 100 : 0;

  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (score > 5) sentiment = 'positive';
  else if (score < -5) sentiment = 'negative';

  return { sentiment, score: Math.round(score * 10) / 10 };
}

function extractKeyThemes(feedback: FeedbackRecord[]): string[] {
  const themeKeywords = {
    'Communication': ['communication', 'communicate', 'speaking', 'listening', 'feedback'],
    'Leadership': ['leadership', 'leader', 'leading', 'management', 'team'],
    'Technical Skills': ['technical', 'programming', 'coding', 'development', 'software'],
    'Problem Solving': ['problem', 'solution', 'solving', 'analytical', 'critical thinking'],
    'Collaboration': ['collaboration', 'teamwork', 'cooperative', 'working together'],
    'Time Management': ['time', 'deadline', 'schedule', 'punctual', 'organized'],
    'Innovation': ['innovative', 'creative', 'ideas', 'thinking outside', 'new approaches']
  };

  const themes: string[] = [];
  const allText = feedback.map(f => f.feedback_text.toLowerCase()).join(' ');

  Object.entries(themeKeywords).forEach(([theme, keywords]) => {
    const mentions = keywords.reduce((count, keyword) => {
      return count + (allText.split(keyword).length - 1);
    }, 0);

    if (mentions > 0) {
      themes.push(theme);
    }
  });

  return themes.slice(0, 5); // Return top 5 themes
}

function extractStrengths(feedback: FeedbackRecord[]): string[] {
  const strengthPatterns = [
    /strong in (.+?)[\.,]/gi,
    /excellent (.+?)[\.,]/gi,
    /good at (.+?)[\.,]/gi,
    /skilled in (.+?)[\.,]/gi,
    /talented (.+?)[\.,]/gi
  ];

  const strengths: Set<string> = new Set();
  
  feedback.forEach(f => {
    strengthPatterns.forEach(pattern => {
      const matches = [...f.feedback_text.matchAll(pattern)];
      matches.forEach(match => {
        if (match[1] && match[1].length < 50) {
          strengths.add(match[1].trim());
        }
      });
    });
  });

  return Array.from(strengths).slice(0, 5);
}

function extractImprovements(feedback: FeedbackRecord[]): string[] {
  const improvementPatterns = [
    /needs to improve (.+?)[\.,]/gi,
    /should work on (.+?)[\.,]/gi,
    /could be better at (.+?)[\.,]/gi,
    /improvement needed in (.+?)[\.,]/gi,
    /focus on (.+?)[\.,]/gi
  ];

  const improvements: Set<string> = new Set();
  
  feedback.forEach(f => {
    improvementPatterns.forEach(pattern => {
      const matches = [...f.feedback_text.matchAll(pattern)];
      matches.forEach(match => {
        if (match[1] && match[1].length < 50) {
          improvements.add(match[1].trim());
        }
      });
    });
  });

  return Array.from(improvements).slice(0, 5);
}
