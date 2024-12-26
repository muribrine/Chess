function set_up_routing(express_app: any, __dirname: any, ROUTES: string[][]) {
 
  ROUTES.forEach(route => {
    
    let req = route[0];
    let res = route[1];

    express_app.get(req, (_: any, response: any) => {
      console.log(`Got a request for ${req}.`);
      response.sendFile(__dirname + res);
    });

  });

};

export { set_up_routing };
