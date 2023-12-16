import { Column, Entity, ManyToOne } from "typeorm";
import Model from "./model.entity";

@Entity("Post")
export default class Post extends Model {
  @Column({ name: "photourl" })
  photourl: string;

  @Column({ name: "userid" })
  userid: string;
}
