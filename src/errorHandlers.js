export const errorHandlers = (err, req, res, next) => {
  err
    ? res.status(err.status).send(err)
    : res.status(500).send({ message: "Something went wrong!" });
};