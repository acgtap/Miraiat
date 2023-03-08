import { Bot, Message, Middleware } from "mirai-js";
import { useListStore } from "../store/List";
import { Dialog, Snackbar } from "@varlet/ui";
let List = useListStore();
let snack = Snackbar["loading"]("正在连接服务器...");
const bot = new Bot();
export async function initSocket() {
  let onBeforeClose = (action, done) => {
    //Snackbar.loading('正在异步关闭')

    setTimeout(() => {
      // actions[action]()
      action;
      done();
    }, 1000);
  };
  console.log("connect to", List.qq);
  // 连接到一个 mirai-api-http 服务
  try {
    await bot.open({
      baseUrl: "http://43.143.109.200:33033",
      verifyKey: "1234567890",
      // 要绑定的 qq，须确保该用户已在 mirai-console 登录
      qq: 2480321637,
    });
  } catch (err) {
    Dialog({
      message: "与服务器连接失败：" + err,
      confirmButtonText: "重连",
      cancelButton: false,
      onBeforeClose: onBeforeClose,
    });
    snack.clear();
    return;
  }
  snack.clear(); //连接成功
  let success = Snackbar["success"]("连接服务器成功");
  setTimeout(() => {
    success.clear();
  }, 2000);
  bot.on("ws error", async (data) => {
    snack.clear();
    let success = Snackbar["danger"]("与服务器连接错误");
    setTimeout(() => {
      success.clear();
    }, 2000);
    data;
  });
  bot.on("ws close", async (data) => {
    snack.clear();
    let success = Snackbar["danger"]("与服务器连接断开");
    setTimeout(() => {
      success.clear();
    }, 2000);
    data;
  });
  // 监听好友消息事件
  bot.on(
    "FriendMessage",
    new Middleware()
      .textProcessor()
      .done(
        async ({ messageChain, sender: { id, nickname, remark }, text }) => {
          const { id: messageId } = messageChain[0];
          messageId;
          List.updateList({
            index_name: List.chatList.length + 1,
            talk_type: 1,
            is_online: 1,
            qq: id,
            draft_text: "",
            msg_text: text,
            is_robot: 0,
            is_top: 0,
            updated_at: new Date().getTime(),
            remark_name: remark ? remark : nickname,
            name: remark ? remark : nickname,
            unread: 1,
            avatar: "http://q2.qlogo.cn/headimg_dl?dst_uin=" + id + "&spec=100",
          });


        }
      )
  );

  // 监听群消息事件
  bot.on(
    "GroupMessage",
    new Middleware().textProcessor().done(
      async ({
        messageChain,
        text,
        sender: {
          id: fromQQ,
          memberName: fromNickname,
          permission: fromQQPermission,
          group: { id: fromGroup, name: groupName, permission: botPermission },
        },
      }) => {
        botPermission;
        fromQQPermission;
        const { id: messageId } = messageChain[0];
        messageId;
        List.updateList({
          index_name: List.chatList.length + 1,
          talk_type: 2,
          is_online: 1,
          qq: fromQQ,
          group: fromGroup,
          draft_text: "",
          msg_text: fromNickname + "：" + text,
          is_robot: 0,
          is_top: 0,
          updated_at: new Date().getTime(),
          remark_name: groupName,
          name: groupName,
          unread: 1,
          avatar:
            "http://p.qlogo.cn/gh/" + fromGroup + "/" + fromGroup + "/100/",
        });


      }
    )
  );

  new Message();
}
export { bot };
