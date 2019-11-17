import $ from 'jquery'

// console.log('asdfasdfasdfasdfasdfasdfasdfdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf');

ajax('/tags').done((data) => {

  const listsArr = JSON.parse(data);

  // console.dir(listsArr)

  let inverted = false, indeterminate = false;

  const grid = $('.content vaadin-grid')[0];
  grid.items = listsArr;

  // console.log('asdfasdfasdfasdf')
  ($(grid).children()[1]).headerRenderer = function (root) {
    root.innerHTML = '<vaadin-grid-sorter path="name">Name</vaadin-grid-sorter>';
  };

  ($(grid).children()[2]).headerRenderer = function (root) {
    root.innerHTML = '<vaadin-grid-sorter path="videos.length">Videos</vaadin-grid-sorter>';
  };
  // grid.size = 200;
  // grid.dataProvider = function(params, callback) {
  //   var xhr = new XMLHttpRequest();
  //   xhr.onload = function() {
  //     callback(JSON.parse(xhr.responseText).result);
  //   };
  //   var index = params.page * params.pageSize;
  //   xhr.open('GET', 'https://demo.vaadin.com/demo-data/1.0/people?index=' + index + '&count=' + params.pageSize, true);
  //   xhr.send();
  // };

  const column = ($(grid).children()[0])

  column.headerRenderer = function(cell) {
    var checkbox = cell.firstElementChild;
    if (!checkbox) {
      checkbox = window.document.createElement('vaadin-checkbox');
      checkbox.setAttribute('aria-label', 'Select All');
      checkbox.setAttribute('style', 'font-size: var(--lumo-font-size-m)');
      checkbox.addEventListener('change', function(e) {
        grid.selectedItems = [];
        inverted = !inverted;
        indeterminate = false;
        grid.render();
      });
      cell.appendChild(checkbox);
    }
    checkbox.checked = indeterminate || inverted;
    checkbox.indeterminate = indeterminate;
  };

    column.renderer = function(cell, column, rowData) {
      var checkbox = cell.firstElementChild;
      if (!checkbox) {
        checkbox = window.document.createElement('vaadin-checkbox');
        checkbox.setAttribute('aria-label', 'Select Row');
        checkbox.addEventListener('change', function(e) {
          if (e.target.checked === inverted) {
            grid.deselectItem(checkbox.__item);
          } else {
            grid.selectItem(checkbox.__item);
          }
          indeterminate = grid.selectedItems.length > 0;
          grid.render();
        });
        cell.appendChild(checkbox);
      }
      checkbox.__item = rowData.item;
      checkbox.checked = inverted !== rowData.selected;
    };
  // });


  // for(const tag in lists) {
  // 	debugger;
  // 	let videos = lists[tag];
  // 	$('.content').append($(`<h4>${tag} (${videos.length})</h4>`));
  // 	for(const video of videos) {
  // 		$('.content').append($(`<a href="/res/${video._id}">${video.title}</a><br>`))
  // 	}
  // }

})

console.log('asdfasdfasdf');