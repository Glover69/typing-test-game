import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TextProviderService {


  private wordList: string[] = [
    "able", "about", "above", "act", "add", "after", "again", "age", "ago", "agree", "air", "all",
    "allow", "alone", "along", "also", "among", "and", "any", "area", "argue", "arm", "art", "as",
    "ask", "at", "avoid", "away", "baby", "back", "bad", "bag", "ball", "bank", "bar", "base", "be",
    "beat", "bed", "begin", "best", "big", "bill", "bit", "black", "blue", "board", "body", "book",
    "born", "both", "box", "boy", "break", "bring", "build", "but", "buy", "by", "call", "can",
    "car", "card", "care", "carry", "case", "catch", "cause", "cell", "center", "chair", "chance",
    "charge", "check", "child", "choose", "church", "city", "civil", "claim", "class", "clear",
    "close", "coach", "cold", "color", "come", "common", "cost", "could", "course", "court", "cover",
    "crime", "cup", "dark", "data", "day", "dead", "deal", "death", "debate", "decide", "deep",
    "degree", "design", "detail", "die", "dinner", "do", "doctor", "dog", "door", "down", "draw",
    "dream", "drive", "drop", "drug", "during", "each", "early", "east", "easy", "eat", "edge",
    "effect", "effort", "eight", "either", "else", "end", "energy", "enjoy", "enough", "enter",
    "entire", "even", "event", "ever", "every", "eye", "face", "fact", "factor", "fail", "fall",
    "family", "far", "fast", "father", "fear", "feel", "few", "field", "fight", "figure", "fill",
    "film", "final", "find", "fine", "finger", "finish", "fire", "firm", "first", "fish", "five",
    "floor", "fly", "focus", "follow", "food", "foot", "for", "force", "forget", "form", "former",
    "four", "free", "friend", "from", "front", "full", "fund", "future", "game", "garden", "gas",
    "get", "girl", "give", "glass", "go", "goal", "good", "great", "green", "ground", "group",
    "grow", "growth", "guess", "gun", "guy", "hair", "half", "hand", "hang", "happen", "happy",
    "hard", "have", "he", "head", "health", "hear", "heart", "heat", "heavy", "help", "her",
    "here", "high", "him", "his", "hit", "hold", "home", "hope", "hot", "hotel", "hour", "house",
    "how", "huge", "human", "idea", "if", "image", "impact", "in", "indeed", "inside", "into",
    "issue", "it", "item", "its", "itself", "job", "join", "just", "keep", "key", "kid", "kill",
    "kind", "know", "land", "large", "last", "late", "later", "laugh", "law", "lawyer", "lay",
    "lead", "leader", "learn", "least", "leave", "left", "leg", "legal", "less", "let", "level",
    "lie", "life", "light", "like", "likely", "line", "list", "listen", "little", "live", "local",
    "long", "look", "lose", "loss", "lot", "love", "low", "main", "major", "make", "man",
    "manage", "many", "market", "matter", "may", "maybe", "me", "mean", "media", "meet",
    "member", "memory", "method", "middle", "might", "mind", "minute", "miss", "model",
    "modern", "moment", "money", "month", "more", "most", "mother", "mouth", "move", "movie",
    "much", "music", "must", "my", "myself", "name", "nation", "nature", "near", "nearly",
    "need", "never", "new", "news", "next", "nice", "night", "no", "none", "nor", "north",
    "not", "note", "notice", "now", "number", "occur", "of", "off", "offer", "office",
    "often", "oh", "oil", "ok", "old", "on", "once", "one", "only", "onto", "open",
    "option", "or", "order", "other", "others", "our", "out", "over", "own", "owner",
    "page", "pain", "paper", "parent", "part", "party", "pass", "past", "pay", "peace",
    "people", "per", "period", "person", "phone", "pick", "piece", "place", "plan",
    "plant", "play", "player", "point", "police", "policy", "poor", "power", "pretty",
    "price", "prove", "public", "pull", "push", "put", "race", "radio", "raise",
    "range", "rate", "rather", "reach", "read", "ready", "real", "really", "reason",
    "recent", "record", "red", "reduce", "region", "relate", "remain", "remove",
    "report", "rest", "result", "return", "reveal", "rich", "right", "rise", "risk",
    "road", "rock", "role", "room", "rule", "run", "safe", "same", "save", "say",
    "scene", "school", "score", "sea", "season", "seat", "second", "see", "seek",
    "seem", "sell", "send", "senior", "sense", "series", "serve", "set", "seven",
    "sex", "sexual", "shake", "share", "she", "shoot", "short", "shot", "should",
    "show", "side", "sign", "simple", "simply", "since", "sing", "single", "sister",
    "sit", "site", "six", "size", "skill", "skin", "small", "smile", "so", "social",
    "some", "son", "song", "soon", "sort", "sound", "source", "south", "space",
    "speak", "speech", "spend", "sport", "spring", "staff", "stage", "stand", "star",
    "start", "state", "stay", "step", "still", "stock", "stop", "store", "story",
    "street", "strong", "study", "stuff", "style", "such", "suffer", "summer", "sure",
    "system", "table", "take", "talk", "task", "tax", "teach", "team", "tell",
    "ten", "tend", "term", "test", "than", "thank", "that", "the", "their", "them",
    "then", "theory", "there", "these", "they", "thing", "think", "third", "this",
    "those", "though", "threat", "three", "throw", "thus", "time", "to", "today",
    "too", "top", "total", "tough", "toward", "town", "trade", "travel", "treat",
    "tree", "trial", "trip", "true", "truth", "try", "turn", "two", "type",
    "under", "unit", "until", "up", "upon", "us", "use", "value", "very", "victim",
    "view", "visit", "voice", "vote", "wait", "walk", "wall", "want", "war",
    "watch", "water", "way", "we", "weapon", "wear", "week", "weight", "well",
    "west", "what", "when", "where", "which", "while", "white", "who", "whole",
    "whom", "whose", "why", "wide", "wife", "will", "win", "wind", "wish", "with",
    "within", "woman", "wonder", "word", "work", "worker", "world", "worry", "would",
    "write", "wrong", "yard", "yeah", "year", "yes", "yet", "you", "young", "your",
    "apple", "beach", "bread", "chair", "clean", "cloud", "dance", "drink", "earth",
    "fight", "ghost", "grass", "green", "house", "juice", "knife", "laugh", "light",
    "magic", "night", "ocean", "peace", "phone", "piano", "quick", "river", "smile",
    "snake", "storm", "sugar", "table", "train", "voice", "watch", "wheel", "write"
  ];

  constructor() { }

  
  getRandomWord(): string {
    const randomIndex = Math.floor(Math.random() * this.wordList.length);
    return this.wordList[randomIndex];
  }

  getRandomWords(count: number): string[] {
    const words: string[] = [];
    for (let i = 0; i < count; i++) {
      words.push(this.getRandomWord());
    }
    return words;
  }
}

