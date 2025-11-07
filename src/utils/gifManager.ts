const CORRECT_GIFS = [
  "https://gifer.com/embed/Aq", // https://i.gifer.com/Aq.gif - Thumbs up
  "https://gifer.com/embed/5e1", // https://i.gifer.com/5e1.gif - Yeah
  "https://gifer.com/embed/2DV", // https://i.gifer.com/2DV.gif - High five
  "https://gifer.com/embed/fxSL", // https://i.gifer.com/fxSL.gif - Champion
  "https://gifer.com/embed/i9", // https://i.gifer.com/i9.gif - Victory
  "https://gifer.com/embed/Bt4", // https://i.gifer.com/Bt4.gif - Success
  "https://gifer.com/embed/NHBl",
  "https://gifer.com/embed/v5T",
  "https://gifer.com/embed/4HRI",
];

const INCORRECT_GIFS = [
  "https://gifer.com/embed/1ze3", // https://i.gifer.com/1ze3.gif - Facepalm
  "https://gifer.com/embed/1vms", // https://i.gifer.com/1vms.gif - Confused
  "https://gifer.com/embed/Elga", // https://i.gifer.com/Elga.gif - Oops
  "https://gifer.com/embed/xC5", // https://i.gifer.com/xC5.gif - Try again
  "https://gifer.com/embed/2yOW", // https://i.gifer.com/2yOW.gif - Oh no
  "https://gifer.com/embed/15D7",
  "https://gifer.com/embed/2Ao",
];

export class GifManager {
  private correctGifs: string[];
  private incorrectGifs: string[];
  private lastCorrectIndex: number = -1;
  private lastIncorrectIndex: number = -1;

  constructor() {
    this.correctGifs = [...CORRECT_GIFS];
    this.incorrectGifs = [...INCORRECT_GIFS];
  }

  getRandomGif(type: "correct" | "incorrect"): string {
    const gifs = type === "correct" ? this.correctGifs : this.incorrectGifs;
    const lastIndex =
      type === "correct" ? this.lastCorrectIndex : this.lastIncorrectIndex;

    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * gifs.length);
    } while (randomIndex === lastIndex && gifs.length > 1);

    if (type === "correct") {
      this.lastCorrectIndex = randomIndex;
    } else {
      this.lastIncorrectIndex = randomIndex;
    }

    return gifs[randomIndex];
  }

  preloadAll() {
    [...CORRECT_GIFS, ...INCORRECT_GIFS].forEach((url) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = url;
      link.as = "image";
      document.head.appendChild(link);

      const img = new Image();
      img.src = url;
    });
  }
}

export const gifManager = new GifManager();
