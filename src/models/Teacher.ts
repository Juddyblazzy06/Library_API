import { ObjectType, Field, ID } from 'type-graphql'
import { prop as Property, getModelForClass } from '@typegoose/typegoose'
import { Student } from './Student'

@ObjectType()
export class Teacher {
  @Field(() => ID)
  id!: string

  @Field()
  @Property({ required: true })
  name!: string

  @Field()
  @Property({ required: true, unique: true })
  email!: string

  @Field()
  @Property({ required: true })
  password!: string

  @Field(() => [Student])
  @Property({ type: () => [Student], default: [] })
  students!: Student[]
}

export const TeacherModel = getModelForClass(Teacher)
