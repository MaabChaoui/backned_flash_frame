import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import Comment from "../comment.entity";
import Post from "../post.entity";
import Photographer from "./photographer.entity";
import Account from "./account.entity";

@Entity("user")
export default class User extends Account {
  @ManyToMany((type) => Photographer, (ph) => ph.followers)
  followings: Photographer[];
}
