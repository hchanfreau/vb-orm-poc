const {sequelize, User, Post, Tag, Comment } = require('./models');

async function setupDatabase() {
  console.log('--- Inside setupDatabase function ---'); // Debug log
  console.log('Iniciando la sincronización del modelo extendido...');
  try {
    await sequelize.sync({ force: true });
    console.log('¡Base de datos sincronizada!');

    console.log('\n--- Creando Usuarios ---');
    const user1 = await User.create({ name: 'Juan Perez' });
    const user2 = await User.create({ name: 'Ana Gomez' });
    console.log('Usuarios creados:', user1.name, ',', user2.name);

    console.log('\n--- Creando Posts ---');
    const post1 = await Post.create({ title: 'Intro a Sequelize', content: 'Sequelize es un ORM genial.', userId: user1.id });
    const post2 = await Post.create({ title: 'Node.js Avanzado', content: 'Explorando streams y buffers.', userId: user1.id });
    const post3 = await Post.create({ title: 'Recetas de Cocina', content: 'Cómo hacer un buen guiso.', userId: user2.id });
    console.log('Posts creados.');

    console.log('\n--- Creando Tags ---');
    const tagNode = await Tag.create({ name: 'nodejs' });
    const tagOrm = await Tag.create({ name: 'orm' });
    const tagTech = await Tag.create({ name: 'tech' });
    const tagFood = await Tag.create({ name: 'food' });
    console.log('Tags creados: nodejs, orm, tech, food');

    console.log('\n--- Asociando Tags a Posts ---');
    await post1.addTags([tagNode, tagOrm, tagTech]);
    await post2.addTag(tagNode); // Se puede pasar un array o una instancia
    await post3.addTag(tagFood);
    console.log('Tags asociados.');

    console.log('\n--- Creando Comentarios ---');
    await Comment.create({ content: '¡Muy buen artículo, gracias!', userId: user2.id, postId: post1.id });
    await Comment.create({ content: 'No entendí la parte de los streams.', userId: user2.id, postId: post2.id });
    await Comment.create({ content: 'Aclarado, ¡gracias por la ayuda!', userId: user1.id, postId: post2.id });
    console.log('Comentarios creados.');


    console.log('\n¡Datos de prueba complejos creados exitosamente!');
    console.log('--- Exiting setupDatabase function ---'); // Debug log
    return { sequelize, User, Post, Tag, Comment }; // Return models for further use
  } catch (error) {
    console.error('Error al configurar la base de datos:', error);
    throw error; // Re-throw to indicate setup failure
  }
}

console.log('--- setup.js is being executed, exporting setupDatabase ---'); // Debug log
module.exports = setupDatabase;
