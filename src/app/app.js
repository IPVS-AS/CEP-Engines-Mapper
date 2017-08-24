var express = require('express');
var reactViews = require('express-react-views');

var app = express();

app.set('port', 3000);
app.set('views', __dirname + '/components');
app.set('view engine', 'jsx');
app.engine('jsx', reactViews.createEngine());
app.use('/static', express.static(__dirname + '/static'));

app.get('*', (req, res) => {
  res.render('App', { url: req.url });
});

app.listen(app.get('port'), () => {
  console.log('[Express] Server listening on port ' + app.get('port'));
});
