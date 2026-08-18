/**
 * validate(schema) — valida req.body contra um schema Zod. Em caso de
 * falha, responde 400 com os detalhes; protege contra entradas malformadas
 * e é uma camada adicional contra payloads inesperados (defesa em
 * profundidade, junto de Sequelize usar queries parametrizadas contra
 * SQL Injection).
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Dados inválidos.',
        details: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}

module.exports = { validate };
