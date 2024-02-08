import { BaseEntity, Column, Entity, Index, OneToMany, PrimaryColumn } from "typeorm";

import commentEntity from "../comment.entity";

@Entity()
export default abstract class Account extends BaseEntity {
  // @Index("account_id_index")
  @PrimaryColumn({
    name: "id",
  })
  id: string;

  @Column({ name: "fname" })
  fName: string;

  @Column({ name: "lname" })
  lName: string;

  @Column({ name: "email", nullable: true })
  email: string;

  @Column({ name: "city", nullable: true })
  city: string;

  @Column({ name: "country", nullable: true })
  country: string;

  @Column({ name: "bio" })
  bio: string;

  @OneToMany(
    (type) => commentEntity,
    (comment: commentEntity) => comment.content
  )
  comments: commentEntity[];
}
