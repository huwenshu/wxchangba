app.showSongList = function () {
  var countPerPage = 20,
    params = app.params,
    rank = params['rank'] || 'latest',
    rankStr = ({
      'latest': '最新',
      'hottest': '最火'
    })[rank],
    page = parseInt(params['page']) || 1,
    $frame = app.$frame,
    $rank = $frame.find('#rank'),
    $total = $frame.find('#total'),
    $tableSongs = $frame.find('#table-songs'),
    $paginSongs = $tableSongs.find('#pagin-songs'),
    $page = $paginSongs.find('#page'),
    $random = $frame.find('#random'),
    $formSearch = $frame.find('#form-search');

  _hmt.push(['_trackEvent', 'admin', 'admin-songlist', 'songlist-'+rank]);

  $rank.text(rankStr);
  $page.text(page);
  $random.on('click', app.gotoRandomSong);
  $formSearch.on('submit', function (ev) {
    ev.preventDefault();
    var msgid = $(this).find('input').val();
    app.loadPage('#song?id=' + msgid);
  });

  document.title = '邑大唱吧-管理平台';

  $.get('../song/list', {
    'rank': rank,
    'limit': countPerPage,
    'skip': countPerPage * (page - 1)
  }, function (data) {
    // 如果是字符串则parseJSON
    if (!_.isObject(data)) data = $.parseJSON(data);
    var msg = data['msg'],
      total = data['total'],
      songs = data['songs'];
    app.notify(msg);    // 提示消息
    if (!songs) throw new Error('歌曲列表加载失败');
    // 信息部署
    $total.text(total);
    _.each(songs, function (song) {  // tbody
      var tbodyHtml = _.reduce(songs, function (memo, song) {
        return memo + [
          '<tr>',
          '<td>' + song.msgid + '</td>',
          '<td>',
          '<a href="#song?id=' + song.msgid + '">' + song.name + '</a>',
          '</td>',
          '<td>' + song.plays + '</td>',
          '</tr>'
        ].join('');
      }, '');
      $tableSongs.find('tbody').html(tbodyHtml)
        .find('tr:nth-child(1)').addClass('selected-row');
    });
    // pagination
    var $active = $paginSongs.find('.active'),
      pageCount = Math.ceil(total / countPerPage),
      hrefTmpl = '#songlist?rank=<%=rank%>&page=<%=page%>',
      hrefTmplFn = _.template(hrefTmpl),
      liTmplFn = _.template('<li><a href="' + hrefTmpl + '"><%=page%></a></li>');
    if (page > 1) {
      $active.before(liTmplFn({
          rank: rank, page: page - 1
        })).siblings('.first').removeClass('disabled').find('a').attr('href', hrefTmplFn({
          rank: rank, page: 1
        }));
    }
    if (page < pageCount) {
      $active.after(liTmplFn({
          rank: rank, page: page + 1
        })).siblings('.last').removeClass('disabled').find('a').attr('href', hrefTmplFn({
          rank: rank, page: pageCount
        }));
    }
    if (pageCount > 2) {
      if (page === 1) {
        $active.next().after(liTmplFn({
          rank: rank, page: page + 2
        }));
      } else if (page === pageCount) {
        $active.prev().before(liTmplFn({
          rank: rank, page: page - 2
        }));
      }
    }
  });
}
