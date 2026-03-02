import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const scriptTema = `
(function() {
  try {
    var tema = localStorage.getItem('tema');
    var fondo = tema === 'light' ? '#fff0f1' : '#080808ff';
    document.documentElement.style.backgroundColor = fondo;
    document.body.style.backgroundColor = fondo;
  } catch(e) {}
})();
`;

const responsiveBackground = `
body {
  background-color: #080808ff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #080808ff;
  }
}

/* Scrollbar web */
*::-webkit-scrollbar {
  width: 6px;
}
*::-webkit-scrollbar-track {
  background: transparent;
}
*::-webkit-scrollbar-thumb {
  background-color: #542428;
  border-radius: 999px;
}
* {
  scrollbar-width: thin;
  scrollbar-color: #542428 transparent;
}
`;