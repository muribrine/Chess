import { Pocketbase, ReturnType } from "./imports.ts";

class DB {

  client: Pocketbase;

  constructor(url: string) { this.client = new Pocketbase(url) };

  async auth(user: string, password: string) {
    try {
      let result: ReturnType<any> = {valid: true, value: await this.client.collection('users').authWithPassword(user, password)};
      return result;
    } catch (error) {
      let result: ReturnType<Error> = {valid: false, value: error};
      return result;
    }
  };

  async signin(user_data: object) {
    try {
      let result: ReturnType<any> = {valid: true, value: await this.client.collection('users').create(user_data)};
      return result;
    } catch (error) {
      let result: ReturnType<Error> = {valid: false, value: error};
      return result;
    }
  }

};

export { DB };
