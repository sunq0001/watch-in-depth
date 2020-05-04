let watchInDepth = require("./watch-in-depth.js");
let watchable1 = watchInDepth();
let obj = { a: 1 };
obj = watchable1.createProxy(obj);

watchable1.on("updated", () => {
  console.log("updated");
});

watchable1.on("updated", (e) => {
  console.log(
    `update current triggered ${JSON.stringify(e.detail.setTriggered)}`
  );
  console.log(e)
  console.log(
    `update previous triggered ${JSON.stringify(e.detail.setTriggeredPrevious)}`
  );
});

watchable1.on("changed", (e) => {
  console.log(
    `change current triggered ${JSON.stringify(e.detail.setTriggered)}`
  );
  console.log(
    `change previous triggered ${JSON.stringify(e.detail.setTriggeredPrevious)}`
  );
});
watchable1.on("read", (e) => {
  console.log(
    `read current triggered ${JSON.stringify(e.detail.getTriggered)}`
  );
  console.log(
    `read previous triggered ${JSON.stringify(e.detail.getTriggeredPrevious)}`
  );
});

watchable1.on("run", (e) => {
  console.log(`run current triggered ${JSON.stringify(e.detail.fnTriggered)}`);
  console.log(
    `run previous triggered ${JSON.stringify(e.detail.fnTriggeredPrevious)}`
  );
});

obj.a = 2;
obj.run = () => console.log("running");
obj.run();
