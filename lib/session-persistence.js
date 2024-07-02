const SeedData = require("./seed-data.js");
const deepCopy = require("./deep-copy.js");
const seedData = require("./seed-data.js");
const { sortTodoLists, sortTodos } = require("./sort");
const nextId = require("./next-id");
const bcrypt = require('bcrypt');


module.exports = class SessionPersistence {
  constructor(session) {
    this._todoLists = session.todoLists || deepCopy(seedData);
    session.todoLists = this._todoLists;
    this.username = session.username;
  }

  async authenticate(username, password) {
    // const AUTHENTICATE = "SELECT null FROM users" +
    //                      "  WHERE username = $1" +
    //                      "    AND password = $2";

    // let result = await dbQuery(AUTHENTICATE, username, password);
    // if (result.rowCount === 0) return false;

    // return bcrypt.compare(password, result.rows[0].password);
  }

  isDoneTodoList(todoList) {
    return todoList.todos.length > 0 && todoList.todos.every(todo => todo.done);
  }

  hasUndoneTodos(todoList) {
    return todoList.todos.some(todo => !todo.done);
  }

  sortedTodoLists() {
    let todoLists = deepCopy(this._todoLists);
    let undone = todoLists.filter(todoList => !this.isDoneTodoList(todoList));
    let done = todoLists.filter(todoList => this.isDoneTodoList(todoList));
    return sortTodoLists(undone, done);
  }

  sortedTodos(todoList) {
    let todoListCopy = deepCopy(todoList);
    let undone = todoListCopy.todos.filter(todo => !todo.done);
    let done = todoListCopy.todos.filter(todo => todo.done);
    return sortTodos(undone, done);
  }

  _findTodoList(todoListId) {
    return this._todoLists.find(todoList => todoList.id === todoListId);
  }

  _findTodo(todoListId, todoId) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return undefined;

    return todoList.todos.find(todo => todo.id === todoId);
  }

  loadTodoList(todoListId) {
    let todoList = this._findTodoList(todoListId);
    return deepCopy(todoList);
  }

  loadTodo(todoListId, todoId) {
    let todo = this._findTodo(todoListId, todoId);
    return deepCopy(todo);
  }

  toggleDoneTodo(todoListId, todoId) {
    let todo = this._findTodo(todoListId, todoId);
    if (!todo) return false;

    todo.done = !todo.done;
    return true;
  }

  deleteTodo(todoListId, todoId) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return false;

    let todoIndex = todoList.todos.findIndex(todo => todo.id === todoId);
    if (todoIndex === -1) return false;

    todoList.todos.splice(todoIndex, 1);
    return true;
  }

  deleteTodoList(todoListId) {
    let todoListIndex = this._todoLists.findIndex(todoList => todoList.id === todoListId);
    if (todoListIndex === -1) return false;

    this._todoLists.splice(todoListIndex, 1);
    return true;
  }

  completeAllTodos(todoListId) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return false;

    todoList.todos.forEach(todo => todo.done = true);
    return true;
  }

  addTodo(todoListId, title) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return false;

    todoList.todos.push({
      title,
      id: nextId(),
      done: false,
    });

    return true;
  }

  setTodoListTitle(todoListId, todoListTitle) {
    let todoList = this._findTodoList(todoListId);
    if (!todoList) return false;

    todoList.title = todoListTitle;
    return true;
  }

  isUniqueConstraintViolation(_error) {
    return false;
  }

  existsTodoListTitle(title) {
    return this._todoLists.some(todoList => todoList.title === title);
  }

  createTodoList(todoListTitle) {
    this._todoLists.push({
      id: nextId(),
      title: todoListTitle,
      todos: []
    });

    return true;
  }
};


/*(req, res, next) => {
  let store = res.locals.store;
  let todoListId = req.params.todoListId;
  let todoListTitle = req.body.todoListTitle;

  const rerenderEditList = () => {
    let todoList = store.loadTodoList(+todoListId);
    if (!todoList) {
      next(new Error("Not found."));
    } else {
      res.render("edit-list", {
        todoListTitle,
        todoList,
        flash: req.flash(),
      });
    }
  };

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().forEach(message => req.flash("error", message.msg));
    rerenderEditList();
  } else if (res.locals.store.existsTodoListTitle(todoListTitle)) {
    req.flash("error", "The list title must be unique.");
    rerenderEditList();
  } else if (!res.locals.store.setTodoListTitle(+todoListId,
                                                todoListTitle)) {
    next(new Error("Not found."));
  } else {
    req.flash("success", "Todo list updated.");
    res.redirect(`/lists/${todoListId}`);
  }
});
*/