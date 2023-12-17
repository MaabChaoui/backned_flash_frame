import { Column, Entity, Index, ManyToOne } from "typeorm";
import Model from "./model.entity";
import User from "./account/user.entity";
import Photographer from "./account/photographer.entity";

@Entity("Post")
export default class Post extends Model {
  @Column({ name: "photourl" })
  photourl: string;

  @Index("user_index")
  @ManyToOne((type) => Photographer, (ph: Photographer) => ph.posts, {nullable: false})
  photographer: Photographer;
}
