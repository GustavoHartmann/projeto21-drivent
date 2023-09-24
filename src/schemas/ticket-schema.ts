import joi from 'joi';

export const ticketsSchema = joi.object({
  ticketTypeId: joi.number().required(),
});
