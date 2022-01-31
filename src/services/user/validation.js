import { checkSchema, validationResult } from "express-validator";

const userschema = {
  name: {
    in: ["body"],
    isString: {
      errorMessage: "name validation failed , type must be string  ",
    },
  },
  job: {
    in: ["body"],
    isString: {
      errorMessage: "job validation failed , type must be  string ",
    },
  },
  postaladdress: {
    in: ["body"],
    isString: {
      errorMessage: "content validation failed , type must be string ",
    },
  },
  email: {
    in: ["body"],
    isEmail: {
      errorMessage: "content validation failed , type must be string ",
    },
  },
  mobile: {
    in: ["body"],
    isNumeric: {
      errorMessage: "content validation failed , type must be string ",
    },
  },
  dob: {
    in: ["body"],
    isDate: {
      errorMessage: "content validation failed , type must be string ",
    },
  },
  personalstatement: {
    in: ["body"],
    isString: {
      errorMessage: "content validation failed , type must be string ",
    },
  },
  skills: {
    in: ["body"],
    isString: {
      errorMessage: "content validation failed , type must be string ",
    },
  },
  hobbies: {
    in: ["body"],
    isString: {
      errorMessage: "content validation failed , type must be string ",
    },
  }
};



const experienceSchema = {
  role: {
    isString: {
      errorMessage: "Text field is required for comment",
    },
  },
  company: {
    isString: {
      errorMessage: "User name is required for comment",
    },
  },
  startDate: {
    isDate: {
      errorMessage: "Text field is required for comment",
    },
  },
  endDate: {
    isDate: {
      errorMessage: "Text field is required for comment",
    },
  },
  position: {
    isString: {
      errorMessage: "Text field is required for comment",
    },
  },
};

export const checkExperienceSchema = checkSchema( experienceSchema);

export const checkuserschema = checkSchema(userschema);

export const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Blog post validation is failed");
    error.status = 400;
    error.errors = errors.array();
    next(error);
  }
  next();
};
