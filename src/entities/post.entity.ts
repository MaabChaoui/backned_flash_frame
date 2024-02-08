import { Column, Entity, Index, ManyToOne } from "typeorm";
import Model from "./model.entity";
import User from "./account/user.entity";
import Photographer from "./account/photographer.entity";

@Entity("Post")
export default class Post extends Model {
  @Column({
    name: "photourl",
    default: "https://live.staticflickr.com/7522/15893732471_eefe3d93b2_m.jpg",
  })
  photourl: string;

  @Column({ name: "downloadable", default: true })
  downloadable: boolean;

  @Index("user_index")
  @ManyToOne((type) => Photographer, (ph: Photographer) => ph.posts, {
    nullable: false,
  })
  photographer: Photographer;
}
