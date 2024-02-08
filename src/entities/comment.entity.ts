import { Column, Entity, ManyToOne } from "typeorm";
import Model from "./model.entity";
import User from "./account/user.entity";
import Photographer from "./account/photographer.entity";
import Account from "./account/account.entity";

@Entity("comment")
export default class Comment extends Model {
  @Column({ name: "content" })
  content: string;

  @ManyToOne((type) => Account, (acc) => acc.comments, { nullable: false })
  account: Account;
}
