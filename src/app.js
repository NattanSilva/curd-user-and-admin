import { hash, compare } from "bcryptjs";
import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import users from "./database";

const app = express();
app.use(express.json());

// Controllers //
export const createUserContoller = async (request, response) => {
  const [status, data] = await createUserService(request.body);

  return response.status(status).json(data);
};

export const loginUserControler = (request, response) => {
  const [status, token] = loginUserService(request.body);

  return response.status(status).json(token);
};

export const getUserDataController = (request, response) => {
  const [status, data] = getUserDataService(request);

  return response.status(status).json(data);
};
const listUsersController = (request, response) => {
  const [status, list] = listUsersService();

  return response.status(status).json(list);
};

// Services //

export const createUserService = async ({ name, email, password, isAdm }) => {
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

export const loginUserService = ({ email }) => {
  const currentUser = users.find((user) => user.email === email);

  const token = jwt.sign({ email }, "SECRET_KEY", {
    expiresIn: "24h",
    subject: currentUser.uuid,
  });

  return [200, { token }];
};

export const getUserDataService = (request) => {
  const authToken = request.headers.authorization.split(" ")[1];
  const { email } = jwt.decode(authToken);
  const user = users.find((regist) => regist.email === email);

  delete user.password;

  return [200, user];
};

export const listUsersService = () => {
  return [200, users];
};

// Middlewares //

export const verifyEmailRegistredMiddleware = (request, response, next) => {
  const { email } = request.body;
  const emailAlreadyRegistred = users.find((regist) => regist.email === email);

  if (emailAlreadyRegistred) {
    return response.status(409).json({ message: "E-mail already registered" });
  }

  return next();
};

export const verifyuserExistsMiddleware = (request, response, next) => {
  const { email } = request.body;
  const userExists = users.find((regist) => regist.email === email);

  if (!userExists) {
    return response.status(401).json({ message: "Wrong email/password" });
  }

  return next();
};

export const verifyPasswordMatchMiddleware = async (
  request,
  response,
  next
) => {
  const { email, password } = request.body;

  const currentUser = users.find((user) => user.email === email);
  const passwordMatch = await compare(password, currentUser.password);

  if (!passwordMatch) {
    return response.status(401).json({ message: "Wrong email/password" });
  }

  return next();
};

export const verifyTokenMiddleware = (request, response, next) => {
  const authToken = request.headers.authorization.split(" ")[1];

  if (!authToken) {
    return response
      .status(401)
      .json({ message: "Missing authorization headers" });
  }

  jwt.verify(authToken, "SECRET_KEY", (error, decoded) => {
    if (error) {
      return response.status(401).json({ message: error.message });
    }

    return next();
  });

  return next();
};

export const verifyIsAdminMiddleware = (request, response, next) => {
  const authToken = request.headers.authorization.split(" ")[1];
  const { email } = jwt.decode(authToken);
  const user = users.find((regist) => regist.email === email);

  if (!user.isAdm) {
    return response.status(403).json({ message: "missing admin permissions" });
  }

  return next();
};

app.post("/users", verifyEmailRegistredMiddleware, createUserContoller);

app.post(
  "/login",
  verifyuserExistsMiddleware,
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

app.listen(process.env.PORT, () =>
  console.log(`App is running at http://localhost:${process.env.PORT}`)
);

export default app;
