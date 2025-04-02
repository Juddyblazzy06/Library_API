import { ObjectType, Field, ID, Int } from 'type-graphql'
import { prop as Property, getModelForClass, pre } from '@typegoose/typegoose'

@ObjectType()
@pre<Book>('save', function () {
  if (this.availableQuantity === undefined) {
    this.availableQuantity = this.quantity
  }
})
export class Book {
  @Field(() => ID)
  id!: string

  @Field()
  @Property({ required: true, minlength: 1 })
  title!: string

  @Field()
  @Property({ required: true, minlength: 2 })
  author!: string

  @Field()
  @Property({ required: true })
  isbn!: string

  @Field(() => Int)
  @Property({ required: true, min: 1900, max: new Date().getFullYear() })
  publishedYear!: number

  @Field(() => Int)
  @Property({ required: true, min: 0 })
  quantity!: number

  @Field(() => Int)
  @Property({
    required: true,
    min: 0,
    default: function () {
      return this.quantity
    },
  })
  availableQuantity!: number
}

export const BookModel = getModelForClass(Book)
