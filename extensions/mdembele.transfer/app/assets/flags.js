export function resolveFlag (country) {
    switch (country) {
      case 'France' : 
        return require("../assets/flags/France.png")
        break;
      case 'Mali' : 
        return require("../assets/flags/Mali.png");
        break;
      case 'Niger' : 
        return require("../assets/flags/Niger.png");
        break;
    }
  }