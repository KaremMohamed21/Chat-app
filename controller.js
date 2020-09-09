const userList = require("./userList");

exports.addUser = ({ id, name, room }) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!name || !room) return { error: "Username or room is required" };

  const existingUser = userList.find(
    (user) => user.name == name && user.room == room
  );
  if (existingUser) return { error: "Username is taken" };

  const user = { id, name, room };
  userList.push(user);

  return { user };
};

exports.removeUser = (id) => {
  const userIndex = userList.findIndex((user) => user.id == id);

  if (userIndex !== -1) return userList.splice(userList, 1)[0];
};

exports.getUser = (id) => userList.find((user) => user.id == id);
exports.getUsersInRoom = (room) => userList.filter((user) => user.room == room);
