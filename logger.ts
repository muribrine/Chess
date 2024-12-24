class Logger {

  constructor () {};

  log(message: any, level: string) {

    if(!message) { throw Error("Attempt to log am empty message.")};
    if(!level) { throw Error("Attempt to log without a log level.")};

    switch (level) {
      case "normal":
        console.log(message);
        break;

      case "warning":
        console.warn(message);
        break;

      case "error":
        console.error(message);
        break;

      case "table":
        console.table(message);
        break;

      default:
        break;
    }

  };

};

export { Logger };
