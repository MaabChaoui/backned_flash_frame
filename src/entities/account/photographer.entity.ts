import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import Comment from "../comment.entity";
import Post from "../post.entity";
import User from "./user.entity";
import Account from "./account.entity";

@Entity("photographer")
export default class Photographer extends Account {
  @ManyToMany((type) => User, (user) => user.followings)
  followers: User[];

  @OneToMany((type) => Post, (post: Post) => post.photographer)
  posts: Post[];
  // add stuff like specialties, categories, etc
}
