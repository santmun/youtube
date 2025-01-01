Necesito una aplicación de transcripcion y resumen de videos de youtube con:

Stack tecnológico:

- Frontend: Nextjs 14 con TypeScript usando App router
- Estilo: Tailwind CSS
- Autenticación: Supabase
- Base de datos: Supabase

Características principales:

- Autenticación de usuarios
- Transcripcion de videos de youtube usando la API de SUPADATA
- Generacion de resumen y puntos importantes usando la API de DEEPSEEK, esto es un llm similar a chatgpt
- Poder guardar los resumenes facilmente en la base de datos
1. Vamos a empezar haciendo el Dashboard que tenga un campo para introducir un enlace a youtube y vamos a conectar SUPADATA
2. Una vez SUPADATA este integrada y funcionando vamos a integrar la API de Deepseek, para que al momento de que lo transcriba le muestre la transcripcion al usuario y aparte le mane la transcripcion a deepseek
3. El usuario debe ver 2 botondes uno de ver transcripcion y otro de resumen y puntos importantes
4. Vamos a hacer la autenticacion y conectar las bases de datos correctamente con supabase