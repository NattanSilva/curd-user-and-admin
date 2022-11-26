import { compare, hash } from "bcryptjs";
import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import users from "./database";

const app = express();
app.use(express.json());

const PORT = process.env.PORT;
const SECRET_KEY = process.env.SECRET_KEY;

// Controllers //
const createUserContoller = async (request, response) => {
  const [status, data] = await createUserService(request.body);

  return response.status(status).json(data);
};

const loginUserControler = (request, response) => {
  const [status, token] = loginUserService(request.body);

  return response.status(status).json(token);
};

const getUserDataController = (request, response) => {
  const [status, data] = getUserDataService(request.headers.authorization);

  return response.status(status).json(data);
};

const listUsersController = (request, response) => {
  const [status, list] = listUsersService();

  return response.status(status).json(list);
};

const actualizeDataController = async (request, response) => {
  const [status, userData] = await actualizeDataService(
    request.body,
    request.params.uuid
  );

  return response.status(status).json(userData);
};

const deleteUserController = (request, response) => {
  const [status, data] = deleteUserService(request.params.uuid);

  return response.status(status).json(data);
};

// Services //

const createUserService = async ({ name, email, password, isAdm }) => {
  const hashedPassword = await hash(password, 10);

  const newUser = {
    uuid: uuidv4(),
    name,
    email,
    createdOn: new Date(),
    updatedOn: new Date(),
    isAdm,
  };

  users.push({ ...newUser, password: hashedPassword });

  return [201, newUser];
};

const loginUserService = ({ email }) => {
  const currentUser = users.find((user) => user.email === email);

  const token = jwt.sign({ email }, SECRET_KEY, {
    expiresIn: "24h",
    subject: currentUser.uuid,
  });

  return [200, { token }];
};

const getUserDataService = (authToken) => {
  const token = authToken.split(" ")[1];
  const { email: currentEmail } = jwt.decode(token);
  const user = users.find((regist) => regist.email === currentEmail);

  const { uuid, name, email, createdOn, updatedOn, isAdm } = user;

  return [200, { uuid, name, email, createdOn, updatedOn, isAdm }];
};

const listUsersService = () => {
  return [200, users];
};

const actualizeDataService = async (body, paramsId) => {
  let userToUpdate = users.find((regist) => regist.uuid === paramsId);

  userToUpdate = { ...userToUpdate, ...body };
  userToUpdate.updatedOn = new Date();

  const userData = { ...userToUpdate };
  delete userData.password;

  return [200, userData];
};

const deleteUserService = (paramsId) => {
  const userIndex = users.findIndex((regist) => regist.uuid === paramsId);

  if (userIndex === -1) {
    return [404, { message: "User not found" }];
  }

  users.splice(userIndex, 1);

  return [204, {}];
};

// Middlewares //

const verifyEmailRegistredMiddleware = (request, response, next) => {
  const { email } = request.body;
  const emailAlreadyRegistred = users.find((regist) => regist.email === email);

  if (emailAlreadyRegistred) {
    return response.status(409).json({ message: "E-mail already registered" });
  }

  return next();
};

const verifyUserExistsMiddleware = (request, response, next) => {
  const { email } = request.body;
  const userExists = users.find((regist) => regist.email === email);

  if (!userExists) {
    return response.status(401).json({ message: "Wrong email/password" });
  }

  return next();
};

const verifyPasswordMatchMiddleware = async (request, response, next) => {
  const { email, password } = request.body;

  const currentUser = users.find((user) => user.email === email);
  const passwordMatch = await compare(password, currentUser.password);

  if (!passwordMatch) {
    return response.status(401).json({ message: "Wrong email/password" });
  }

  return next();
};

const verifyTokenMiddleware = (request, response, next) => {
  const authToken = request.headers.authorization;

  if (!authToken) {
    return response
      .status(401)
      .json({ message: "Missing authorization headers" });
  }

  const token = authToken.split(" ")[1];

  jwt.verify(token, SECRET_KEY, (error, decoded) => {
    if (error) {
      return response.status(401).json({ message: error.message });
    }

    return next();
  });
};

const verifyIsAdminMiddleware = (request, response, next) => {
  const authToken = request.headers.authorization.split(" ")[1];
  const { email } = jwt.decode(authToken);
  const user = users.find((regist) => regist.email === email);

  if (!user.isAdm) {
    return response.status(403).json({ message: "missing admin permissions" });
  }

  return next();
};

const verifyUserPermissionsMiddleware = (request, response, next) => {
  const token = request.headers.authorization.split(" ")[1];
  const paramsId = request.params.uuid;
  const { email: currentEmail } = jwt.decode(token);
  const currentUser = users.find((regist) => regist.email === currentEmail);

  if (!currentUser.isAdm && currentUser.uuid !== paramsId) {
    return response.status(403).json({ message: "missing admin permissions" });
  }

  return next();
};
// Routes //

app.post("/users", verifyEmailRegistredMiddleware, createUserContoller);

app.post(
  "/login",
  verifyUserExistsMiddleware,
  verifyPasswordMatchMiddleware,
  loginUserControler
);

app.get(
  "/users",
  verifyTokenMiddleware,
  verifyIsAdminMiddleware,
  listUsersController
);

app.get("/users/profile", verifyTokenMiddleware, getUserDataController);

app.patch(
  "/users/:uuid",
  verifyTokenMiddleware,
  verifyUserPermissionsMiddleware,
  actualizeDataController
);

app.delete(
  "/users/:uuid",
  verifyTokenMiddleware,
  verifyUserPermissionsMiddleware,
  deleteUserController
);

app.listen(PORT, () =>
  console.log(`App is running at http://localhost:${PORT}`)
);

export default app;
