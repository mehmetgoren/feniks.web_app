export interface ClientInfoModel{
  ip: string;
  uag: string;
  location: string;
  data_center_location: string;
}

export interface User extends ClientInfoModel{
  id: string;
  username: string;
  password: string;
  last_login_at: string;
  token: string;
  email: string;
}

export interface RegisterUserViewModel extends ClientInfoModel {
  username: string;
  password: string;
  re_password: string;
  email: string;
}

export interface LoginUserViewModel {
  username: string;
  password: string;
}
