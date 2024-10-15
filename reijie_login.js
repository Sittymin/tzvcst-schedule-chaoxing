import { setMaxDigits, RSAKeyPair, encryptedString } from "./rsa.mjs";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output, exit } from "node:process";

const authenticate = async () => {
  const init = (url) => {
    return url + "InterFace.do?method=";
    // 如果需要登出的话直接方法为 logout 就好了
  };

  const post = async (url, data) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        // 也许可以解决多设备限制
        "User-Agent": "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
      },
      body: data,
    });
    return response.json();
  };

  const encryptPassword = (password) => {
    setMaxDigits(130);
    const key = new RSAKeyPair(
      "10001",
      "",
      "9c2899b8ceddf9beafad2db8e431884a79fd9b9c881e459c0e1963984779d6612222cee814593cc458845bbba42b2d3474c10b9d31ed84f256c6e3a1c795e68e18585b84650076f122e763289a4bcb0de08762c3ceb591ec44d764a69817318fbce09d6ecb0364111f6f38e90dc44ca89745395a17483a778f1cc8dc990d87c3",
    );
    // console.log("key: ", key);
    return encryptedString(key, password);
  };

  // 这个学校认证的服务器应该不会改
  const ePortalUrl = init("http://172.16.2.9:8080/eportal/");

  // 读取输入
  const rl = readline.createInterface({
    input,
    output,
  });
  const input_username = await rl.question("输入账号(学号):\n");
  const input_password = await rl.question("请输入密码(身份证后六位):\n");
  const service_select = await rl.question(
    "选择运营商\n(1)中国电信\n(2)中国移动\n输入数字:",
  );
  rl.close();

  const username = encodeURIComponent(encodeURIComponent(input_username));
  const password = encodeURIComponent(encodeURIComponent(input_password));
  const service = encodeURIComponent(
    encodeURIComponent(service_select == 1 ? "中国电信" : "中国移动"),
  );
  const queryString = encodeURIComponent(
    encodeURIComponent("nasip=7b3ad2fa097d34acd2131b2fd77ea6f0"),
  );
  // 好像是运营商账号密码，不过始终是空字符
  const operatorPwd = "";
  const operatorUserId = "";
  // 不明所以的一个需要的参数
  const code = "";
  // 网页中是必然加密的, 实际上可以不加密登录
  const passwordEncrypt = "true";
  const encryptedPassword = encryptPassword(password);
  console.log("加密后的密码:\n", encryptedPassword);

  // 请求的参数
  const content = `userId=${username}&password=${encryptedPassword}&service=${service}&queryString=${queryString}&operatorPwd=${operatorPwd}&operatorUserId=${operatorUserId}&validcode=${code}&passwordEncrypt=${passwordEncrypt}`;

  const authResult = await post(ePortalUrl + "login", content);

  if (authResult.result === "success") {
    console.log("登录成功");
    exit(0);
    // 跳转到管理界面
    // window.location = `success.jsp?userIndex=${authResult.userIndex}&keepaliveInterval=${authResult.keepaliveInterval}`;
  } else {
    console.log(authResult.message);
    exit(1);
  }
};

authenticate();
