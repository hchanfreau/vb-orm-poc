const { User, Post, Tag, Comment } = require('./models');
// const sequelize = require('./database'); // No longer directly imported here

async function lazyLoadingExample(sequelizeInstance) { // Accepts sequelize instance
  console.log('--- Ejemplo de Lazy Loading en Cascada ---');
  console.log('Se demuestra cómo la carga perezosa puede llevar a una cascada de consultas (N+1).\n');

  try {
    sequelizeInstance.options.logging = console.log; // Use provided instance

    console.log('--- Consulta 1: Obteniendo todos los usuarios ---');
    const users = await User.findAll();
    console.log(`\nSe encontraron ${users.length} usuarios.`);

    const resultData = []; // To store structured results

    for (const user of users) {
      console.log(`\n--- Usuario: ${user.name} ---`);
      const userData = user.toJSON();
      userData.posts = [];

      console.log(`\n--- Consulta N: Obteniendo posts para ${user.name} ---`);
      const posts = await user.getPosts(); // <-- Consulta #2 (y #3, #4...)

      for (const post of posts) {
        console.log(`  Post: "${post.title}"`);
        const postData = post.toJSON();
        postData.tags = [];
        postData.comments = [];

        console.log(`\n  --- Consulta N+M: Obteniendo tags para "${post.title}" ---`);
        const tags = await post.getTags(); // <-- Otra consulta
        tags.forEach(tag => postData.tags.push(tag.toJSON()));

        console.log(`\n  --- Consulta N+M+P: Obteniendo comments para "${post.title}" ---`);
        const comments = await post.getComments(); // <-- Y otra consulta más
        for (const comment of comments) {
            // If author needed: const author = await comment.getUser();
            postData.comments.push(comment.toJSON());
        }
        userData.posts.push(postData);
      }
      resultData.push(userData);
    }

    sequelizeInstance.options.logging = false; // Reset logging
    console.log('\nSe ejecutó una consulta para usuarios, luego N para posts, y para cada post, M para tags y P para comments.');
    console.log('Esto es una explosión de consultas que debe evitarse en producción.');
    return resultData; // Return the structured results
  } catch (error) {
    console.error('Error durante el ejemplo de lazy loading:', error);
    throw error;
  }
  // Removed finally block with sequelize.close()
}

module.exports = lazyLoadingExample;