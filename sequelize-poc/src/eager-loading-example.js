const { User, Post, Tag, Comment } = require('./models');
// const sequelize = require('./database'); // No longer directly imported here

async function eagerLoadingExample(sequelizeInstance) { // Accepts sequelize instance
  console.log('--- Ejemplo de Eager Loading Anidado (Nested Eager Loading) ---');
  console.log('Se busca a todos los usuarios y se incluye su grafo de objetos relacionado (posts, tags y comments) en UNA SOLA consulta.\n');

  try {
    sequelizeInstance.options.logging = console.log; // Use provided instance

    const users = await User.findAll({
      include: [
        {
          model: Post,
          as: 'posts',
          include: [
            {
              model: Tag,
              as: 'tags',
              through: { attributes: [] },
            },
            {
              model: Comment,
              as: 'comments',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['name'],
                }
              ]
            }
          ],
        },
      ],
    });

    sequelizeInstance.options.logging = false; // Reset logging
    return users.map(user => user.toJSON()); // Return plain JSON
  } catch (error) {
    console.error('Error durante el ejemplo de eager loading:', error);
    throw error;
  }
  // Removed finally block with sequelize.close()
}

module.exports = eagerLoadingExample;