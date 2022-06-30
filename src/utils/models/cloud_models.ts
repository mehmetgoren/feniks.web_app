export interface TelegramBot{
  token: string;
  url: string;
}

export interface TelegramUser{
  id:number;

  first_name:string;
  last_name:string;
  username:string;
  language_code:string;
  is_bot:boolean;

  can_join_groups:boolean;
  can_read_all_group_messages:boolean;
  supports_inline_queries:boolean;
}

export interface TelegramViewModel{
  enabled: boolean;
  bot: TelegramBot;
  users: TelegramUser[];
}
