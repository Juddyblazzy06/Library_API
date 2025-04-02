import { ObjectType, Field, ID } from 'type-graphql'
import { prop, getModelForClass, modelOptions } from '@typegoose/typegoose'

@ObjectType()
@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: 'teachers',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
})
export class Teacher {
  @Field(() => ID)
  id!: string

  @Field()
  @prop({ required: true })
  name!: string

  @Field()
  @prop({ required: true, unique: true })
  email!: string

  @Field()
  @prop({ required: true })
  password!: string

  @Field()
  @prop({ required: true })
  subject!: string

  @Field()
  @prop({ required: true })
  phone!: string

  @Field(() => [String])
  @prop({ type: [String], default: [] })
  students!: string[]
}

// Create the model with custom options to prevent problematic indexes
export const TeacherModel = getModelForClass(Teacher, {
  schemaOptions: {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'teachers',
  },
})
