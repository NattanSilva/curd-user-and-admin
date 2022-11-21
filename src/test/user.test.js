import request from "supertest";
import app from "../app";
import users from "../database";
import * as bcrypt from "bcryptjs";

const userAdm = {
  name: "felipe",
  email: "felipe@kenzie.com",
  password: "123456",
  isAdm: true,
};

const loginAdm = {
  email: "fabio@kenzie.com",
  password: "123456",
};

const userNotAdm = {
  uuid: "8643c029-04f9-448c-9b9b-630ad89db8b3",
  name: "joana",
  email: "joana@kenzie.com",
  password: bcrypt.hashSync("123456", 8),
  isAdm: false,
  createdOn: "2022-11-17T11:42:25.262Z",
  updatedOn: "2022-11-17T11:42:25.262Z"
};

const loginNotAdm = {
  email: "joana@kenzie.com",
  password: "123456",
};

let tokenAdm = ""

let tokenNotAdm = ""

users.push({
  uuid: "2a577c94-bd28-480d-a20e-cc401e3a259e",
  name: "fabio",
  email: "fabio@kenzie.com",
  password: bcrypt.hashSync("123456", 8),
  isAdm: true,
})
users.push(userNotAdm)

describe("Testes rota POST /users", () => {
  test("Testando criação de usuário com um corpo correto", async () => {
    const response = await request(app).post("/users").send(userAdm);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("email");
    expect(response.body).toHaveProperty("createdOn");
    expect(response.body).toHaveProperty("updatedOn");
    expect(response.body).toHaveProperty("uuid");
    expect(response.body).toHaveProperty("isAdm");
    expect(response.body).not.toHaveProperty("password");

  });

  test("Testando criação de usuário com e-mail já utilizado", async () => {
    const response = await request(app).post("/users").send(userAdm);

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("message");
  });
});

describe("Testando rota POST /login", () => {
  test("Testando login válido", async () => {
    const response = await request(app).post("/login").send(loginAdm);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(typeof response.body.token).toBe("string");

    const notAdmLogin = await request(app).post("/login").send(loginNotAdm);
    tokenNotAdm = notAdmLogin.body.token
    tokenAdm = response.body.token
  });

  test("Testando login inválido", async () => {
    loginAdm.password = "123";
    const response = await request(app).post("/login").send(loginAdm);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });
});

describe("Testando rota GET /users", () => {
  test("Testando listagem de usuários", async () => {
    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${tokenAdm}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("Testando listagem de usuários sem token", async () => {
    const response = await request(app).get("/users");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });

  test("Testando listagem de usuários sem permissão de ADM", async () => {
    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${tokenNotAdm}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message");
  });
});

describe("Testando rota GET /users/profile", () => {
  test("Testando listagem do perfil de usuário", async () => { 
    const response = await request(app)
      .get("/users/profile")
      .set("Authorization", `Bearer ${tokenNotAdm}`);

    expect(response.body).toHaveProperty("uuid");
    expect(response.body).toHaveProperty("createdOn");
    expect(response.body).toHaveProperty("updatedOn");
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("email");
    expect(response.body).toHaveProperty("isAdm");
    expect(response.body).not.toHaveProperty("password");
  });

  test("Testando listagem do perfil de usuário sem token", async () => {
    const response = await request(app).get("/users/profile");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });
});

const updateNotAdm = {
  name: "joana Ono",
  password: "1234",
};

const updateAdm = {
  name: "felipe Silva",
  email: "felipe@kenzie.com",
};

describe("Testando rota PATCH /users/<uuid>", () => {
  test("Testando atualização sem token", async () => {
    const response = await request(app)
      .patch(`/users/8643c029-04f9-448c-9b9b-630ad89db8b3`)
      .send(updateNotAdm);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });

  test("Testando atualização do próprio usuário sem permissão de ADM", async () => { 
    const response = await request(app)
      .patch(`/users/8643c029-04f9-448c-9b9b-630ad89db8b3`)
      .send(updateNotAdm)
      .set("Authorization", `Bearer ${tokenNotAdm}`);

    expect(response.body).toHaveProperty("uuid");
    expect(response.body).toHaveProperty("createdOn");
    expect(response.body).toHaveProperty("updatedOn");
    expect(response.body).toHaveProperty("name", updateNotAdm.name);
    expect(response.body).toHaveProperty("email");
    expect(response.body).toHaveProperty("isAdm", userNotAdm.isAdm);
    expect(response.body).not.toHaveProperty("password");
  });

  test("Testando atualização de outro usuário sem permissão de ADM", async () => {
    const response = await request(app)
      .patch(`/users/2a577c94-bd28-480d-a20e-cc401e3a259e`)
      .send(updateAdm)
      .set("Authorization", `Bearer ${tokenNotAdm}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message");
  });

  test("Testando atualização de qualquer usuário com permissão de ADM", async () => {
    const response = await request(app)
      .patch(`/users/8643c029-04f9-448c-9b9b-630ad89db8b3`)
      .send({ name: "joana Kenzie" })
      .set("Authorization", `Bearer ${tokenAdm}`);

    expect(response.body).toHaveProperty("name", "joana Kenzie");
  });
});

describe("Testando rota DELETE /users/<uuid>", () => {
  test("Testando deleção sem token", async () => {
    const response = await request(app).delete(`/users/2a577c94-bd28-480d-a20e-cc401e3a259e`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });

  test("Testando deleção de outro usuário sem permissão de ADM", async () => {
    const response = await request(app)
      .delete(`/users/2a577c94-bd28-480d-a20e-cc401e3a259e`)
      .set("Authorization", `Bearer ${tokenNotAdm}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message");
  });

  test("Testando deleção de outro usuário com permissão de ADM", async () => {
    const response = await request(app)
      .delete(`/users/8643c029-04f9-448c-9b9b-630ad89db8b3`)
      .set("Authorization", `Bearer ${tokenAdm}`);

    expect(response.status).toBe(204);
  });

  test("Testando deleção do próprio usuário", async () => {

    const response = await request(app)
      .delete(`/users/2a577c94-bd28-480d-a20e-cc401e3a259e`)
      .set("Authorization", `Bearer ${tokenAdm}`);

    expect(response.status).toBe(204);
  });
});
