import { Pocketbase } from "./imports.ts";

class DB {

  client: Pocketbase;

  constructor(url: string) {

    this.client = new Pocketbase(url);

  };

  async get_collection(collection: string) {
    try {
      return [true, await this.client.collection(collection).getFullList({})];
    } catch (error) {
      return [false, error];
    }
  };

  async auth(user: string, password: string) {
    try {
      return [true, await this.client.collection('users').authWithPassword(user, password)];
    } catch (error) {
      return [false, error];
    }
  };

  async signin(user_data: object) {
    try {
      return [true, await this.client.collection('users').create(user_data)];
    } catch (error) {
      return [false, error];
    }
  }

};

export { DB };
