import {history, RequestConfig} from 'umi';

const authHeaderInterceptor = (url: string, options: any) => {
  getInitialState().then((res) => {
    if (res?.authorization) {
      options.headers.authorization = res?.authorization
    }
    if (res?.mid) {
      options.headers.mid = res?.mid
    }
  });
  return {url, options};
};

const prefixes = (env: any) => {
  let prefix = undefined;
  switch (env) {
    case 'production':
      prefix = 'https://1977.work';
      break;
    case 'development':
      prefix = 'http://127.0.0.1:80';
      break;
    default:
      break;
  }
  return prefix;
};

export const request: RequestConfig = {
  prefix: prefixes(process.env.NODE_ENV),
  requestInterceptors: [authHeaderInterceptor],
  errorConfig: {
    adaptor: (resData: any) => {
      console.log(resData)
      if (resData.code) {
        switch (resData.code) {
          case  'SESSION_EXPIRE':
            localStorage.removeItem("info")
            localStorage.removeItem("authorization")
            history.push("/login");
            break;
          default:
            break;
        }
      }
      return {...resData, errorMessage: resData.message}
    },
  },
};

export async function getInitialState() {
  const infoStr = localStorage.getItem('info');
  const authorization = localStorage.getItem('authorization')?.replace(/\"/g, "");
  if (infoStr && authorization) {
    const info = JSON.parse(infoStr, function (key, value) {
      if (value === null) {
        return undefined;
      }
      return value;
    });
    return {authorization, ...info};
  }
}

export const layout = () => {
  return {
    logout: () => {
      localStorage.clear();
      history.push("/login");
    }
  };
};
