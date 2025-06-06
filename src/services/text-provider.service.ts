import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TextProviderService {


  private wordList: string[] = [
    "ability", "able", "about", "above", "accept", "across", "act", "action",
    "add", "adult", "affect", "after", "again", "age", "agency", "agent", "ago", "agree", "ahead", "air", "all",
    "allow", "almost", "alone", "along", "also", "always", "among",
    "amount", "and", "animal", "answer", "any", "anyone", "appear",
    "apply", "area", "argue", "arm", "around", "arrive", "art", "artist", "as",
    "ask", "assume", "at", "attack", "author",
    "avoid", "away", "baby", "back", "bad", "bag", "ball", "bank", "bar", "base", "be",
    "beat", "become", "bed", "before", "begin", "behind",
    "belief", "best", "better", "beyond", "big", "bill", "bit", "black", "blood",
    "blue", "board", "body", "book", "born", "both", "box", "boy", "break", "bring",
    "build", "but", "buy", "by", "call", "camera", "can", "cancer",
    "car", "card", "care", "career", "carry", "case", "catch", "cause", "cell",
    "center", "chair", "chance", "change",
    "charge", "check", "child", "choice", "choose", "church", "city", "civil",
    "claim", "class", "clear", "close", "coach", "cold", "color",
    "come", "common", "cost", "could", "couple", "course", "court", "cover", "create", "crime",
    "cup", "dark", "data", "day", "dead", "deal",
    "death", "debate", "decade", "decide", "deep",
    "degree",
    "design", "detail", "die", "dinner", "do", "doctor", "dog", "door", "down", "draw", "dream", "drive",
    "drop", "drug", "during", "each", "early", "east", "easy", "eat", "edge",
    "effect", "effort", "eight", "either", "else", "end", "energy",
    "enjoy", "enough", "enter", "entire", "even", "event", "ever", "every",
    "eye",
    "face", "fact", "factor", "fail", "fall", "family", "far", "fast", "father", "fear",
    "feel", "few", "field", "fight", "figure", "fill", "film", "final",
    "find", "fine", "finger", "finish", "fire", "firm", "first", "fish", "five", "floor", "fly", "focus",
    "follow", "food", "foot", "for", "force", "forget", "form", "former", "four",
    "free", "friend", "from", "front", "full", "fund", "future", "game", "garden", "gas",
    "get", "girl", "give", "glass", "go", "goal", "good", "great", "green",
    "ground", "group", "grow", "growth", "guess", "gun", "guy", "hair", "half", "hand", "hang", "happen",
    "happy", "hard", "have", "he", "head", "health", "hear", "heart", "heat", "heavy", "help", "her",
    "here", "high", "him", "his", "hit", "hold", "home", "hope",
    "hot", "hotel", "hour", "house", "how", "huge", "human",
    "idea", "if", "image", "impact", "in",
    "indeed", "inside",
    "into",
    "issue", "it", "item", "its", "itself", "job", "join", "just", "keep", "key",
    "kid", "kill", "kind", "know", "land", "large", "last", "late",
    "later", "laugh", "law", "lawyer", "lay", "lead", "leader", "learn", "least", "leave", "left", "leg",
    "legal", "less", "let", "level", "lie", "life", "light", "like", "likely", "line", "list",
    "listen", "little", "live", "local", "long", "look", "lose", "loss", "lot", "love", "low",
    "main", "major", "make", "man", "manage",
    "many", "market", "matter", "may", "maybe", "me", "mean", "media",
    "meet", "member", "memory", "method", "middle", "might",
    "mind", "minute", "miss", "model", "modern", "moment", "money",
    "month", "more", "most", "mother", "mouth", "move", "movie", "Mr", "Mrs",
    "much", "music", "must", "my", "myself", "name", "nation", "nature", "near",
    "nearly", "need", "never", "new", "news", "next", "nice",
    "night", "no", "none", "nor", "north", "not", "note", "notice", "now", "n't", "number",
    "occur", "of", "off", "offer", "office", "often", "oh", "oil", "ok", "old",
    "on", "once", "one", "only", "onto", "open", "option", "or", "order",
    "other", "others", "our", "out", "over", "own", "owner", "page", "pain",
    "paper", "parent", "part", "party",
    "pass", "past", "pay", "peace", "people", "per",
    "period", "person", "phone", "pick", "piece", "place",
    "plan", "plant", "play", "player", "point", "police", "policy", "poor",
    "power",
    "pretty", "price",
    "prove", "public", "pull", "push", "put",
    "race", "radio", "raise", "range", "rate", "rather", "reach", "read",
    "ready", "real", "really", "reason", "recent",
    "record", "red", "reduce", "region", "relate",
    "remain", "remove", "report", "rest", "result", "return", "reveal", "rich",
    "right", "rise", "risk", "road", "rock", "role", "room", "rule", "run", "safe", "same", "save", "say",
    "scene", "school", "score", "sea", "season", "seat", "second",
    "see", "seek", "seem", "sell", "send", "senior", "sense", "series", "serve",
    "set", "seven", "sex", "sexual", "shake", "share", "she", "shoot", "short",
    "shot", "should", "show", "side", "sign", "simple", "simply",
    "since", "sing", "single", "sister", "sit", "site", "six", "size", "skill", "skin",
    "small", "smile", "so", "social", "some",
    "son", "song", "soon", "sort", "sound", "source", "south", "space", "speak",
    "speech", "spend", "sport", "spring", "staff", "stage", "stand", "star", "start", "state", "stay", "step", "still", "stock", "stop", "store",
    "story", "street", "strong", "study", "stuff", "style",
    "such", "suffer", "summer", "sure",
    "system", "table", "take", "talk", "task", "tax", "teach", "team",
    "tell", "ten", "tend", "term", "test", "than", "thank", "that", "the", "their", "them",
    "then", "theory", "there", "these", "they", "thing", "think", "third", "this", "those",
    "though", "threat", "three", "throw", "thus", "time",
    "to", "today", "too", "top", "total", "tough", "toward", "town", "trade",
    "travel", "treat", "tree", "trial", "trip", "true",
    "truth", "try", "turn", "TV", "two", "type", "under", "unit", "until", "up", "upon",
    "us", "use", "value", "very", "victim", "view", "visit", "voice",
    "vote", "wait", "walk", "wall", "want", "war", "watch", "water", "way", "we", "weapon", "wear", "week",
    "weight", "well", "west", "what", "when", "where", "which", "while",
    "white", "who", "whole", "whom", "whose", "why", "wide", "wife", "will", "win", "wind",
    "wish", "with", "within", "woman", "wonder", "word", "work", "worker", "world", "worry",
    "would", "write", "wrong", "yard", "yeah", "year", "yes", "yet", "you", "young", "your"
    // Add more words as needed
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

