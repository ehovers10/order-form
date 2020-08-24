$(document).ready(function() {
  $.getJSON( "/javascripts/fields.json", function( data ) {
    var $group = null, $repeat = null;
    data.survey.forEach(item => {

      if (item.type.includes('repeat')) {
        if (item.type.includes('begin')) {
          $repeat = $('<fieldset></fieldset>');
          $repeat.addClass('repeat');
          $repeat.attr('data-repeat',item.name);
          $repeat.attr('data-instance',1);
          if (item.relevance) $repeat.attr('data-relevance',item.relevance);
          $repLabel = $('<legend></legend>');
          $repLabel.text(item.label);
          $repLabel.appendTo($repeat);
          $repLabel.after(`<h4>Repeat Instance 1</h4>`);
        } else {
          let addType = {
            'type': 'button',
            'name': 'add',
            'label': `Add another ${$repLabel.text()} instance?`,
          };
          let removeType = {
            'type': 'button',
            'name': 'remove',
            'label': `Remove this ${$repLabel.text()} instance?`,
          }
          let $add = buildInput(addType);
          let $remove = buildInput(removeType);
          $add.addClass('add-repeat');
          $remove.addClass('remove-repeat');
          $remove.hide();
          $repeat.append($add).append($remove);
          $repeat.appendTo('main');
          $repeat = null;
        }
      } else if (item.type.includes('group')) {
        if (item.type.includes('begin')) {
          $group = $('<fieldset></fieldset>');
          $group.attr('data-page',item.name);
          if (item.relevance) $group.attr('data-relevance',item.relevance);
          $grpLabel = $('<legend></legend>');
          $grpLabel.text(item.label);
          $grpLabel.appendTo($group);
        } else {
          if ($repeat) {
            $group.appendTo($repeat);
          } else {
            $group.appendTo('main');
            $group = null;
          }
        }
      } else {
        let field = buildSnippet(item,data.choices);
        let attach = ($group) ? $group : ($repeat) ? $repeat : $('main');
        $(field).appendTo(attach);
      }
    });
    addRepeat($('main'));


    $('[data-meta]').add('[data-type="calculate"]').hide();

    formSpecifics();
  });
});
function formSpecifics() {
  let sectColors = [{
    'id': 'Return_Delivery_2020',
    'color': 'color1'
  },{
    'id': 'Add_Delivery_2020',
    'color': 'color2'
  },{
    'id': 'Return_Add_Delivery_2020',
    'color': 'color3'
  },{
    'id': 'Replant_2020',
    'color': 'color4'
  },{
    'id': 'Return_Replant_2020',
    'color': 'color5'
  }];
  $('#order_add').find('option').each(function() {
    let sect = $(this).val();
    if ($(this).is(':selected')) {
      $('.repeat').add('fieldset').each(function() {
        if ($(this).attr('data-relevance') && $(this).attr('data-relevance').includes(sect)) $(this).show();
      });
    } else {
      $('.repeat').add('fieldset').each(function() {
        if ($(this).attr('data-relevance') && $(this).attr('data-relevance').includes(sect)) $(this).hide();
      });
    }
  });
  $('#order_add').change(function() {
    $(this).find('option').each(function() {
      let sect = $(this).val();
      if ($(this).is(':selected')) {
        $('fieldset').each(function() {
          let item = sectColors.find(e => e.id == sect);
          if ($(this).attr('data-relevance') && $(this).attr('data-relevance').includes(sect)) {
            $(this).addClass(item.color);
            $(this).show();
          }
        });
      } else {
        $('fieldset').each(function() {
          if ($(this).attr('data-relevance') && $(this).attr('data-relevance').includes(sect)) $(this).hide();
        });
      }
    });
  });
}
function addRepeat(elem) {
  elem.find('.add-repeat').click(function() {
    let $parent = $(this).parent('.repeat');
    let $newInstance = parseInt($parent.attr('data-instance')) + 1;
    let $newRepeat = $parent.clone();
    $newRepeat.attr('data-instance',$newInstance);
    $parent.after($newRepeat);
    $(this).hide();
    $parent.find('.remove-repeat').show();
    $newRepeat.find('.remove-repeat').show();
    $(this).off('click');
    addRepeat($newRepeat);
    $('.remove-repeat').click(function() {
      let conf = confirm('Are you sure you want to delete this instance?');
      if (conf) {
        let $parent = $(this).parent('.repeat');
        let $prevParent = $parent.prev('.repeat');
        $parent.remove();
        $prevParent.find('.add-repeat').show();
      }
    });
    $('.repeat').each(function() {
      let inst = $(this).attr('data-instance');
      $(this).find('h4').remove();
      $(this).find('legend').after(`<h4>(Repeat Instance ${inst})</h4>`);
    });
  });
}
function buildSnippet(item,lists) {
  if (item.type.includes('select')) {
    let name = item.type.split(' ');
    var list = lists.filter(l => l.list_name == name[name.length - 1]);
  }
  return buildInput(item,list);
}
function buildInput(item,list) {
  let type = item.type.split(' ');
  let $label = $('<label></label>');
  $label.attr('for',item.name);
  $label.text(item.label);
  let $input = '';
  let $field = $('<div></div>');
  $field.addClass('field');
  $field.attr('data-type',item.type);
  if (item.calculation) $field.attr('data-calculation',item.calculation);
  if (item.relevance) $field.attr('data-relevance',item.relevance);
  if (item.meta) $field.attr('data-meta',true);
  switch(type[0]) {
    case 'select_one':
      $input = $('<select></select>');
      list.forEach(i => {
        let $option = $('<option></option>');
        $option.attr('value',i.name);
        $option.text(i.label);
        $option.appendTo($input);
      });
      $field.append($label).append($input);
      break;
    case 'select_multiple':
      $input = $('<select></select>');
      $input.attr('multiple',true);
      list.forEach(i => {
        let $option = $('<option></option>');
        $option.attr('value',i.name);
        $option.text(i.label);
        $option.appendTo($input);
      });
      $field.append($label).append($input);
      break;
    case 'button':
      $input = $('<button></button>');
      $input.text(item.label);
      $field.append($input);
      break;
    case 'date':
      $input = $('<input />');
      $input.attr('type','date');
      $field.append($label).append($input);
      break;
    case 'checkbox':
      $input = $('<input />');
      $input.attr('type','checkbox');
      $field.append($input).append($label);
      break;
    case 'text':
      if (item.appearance && item.appearance.includes('note')) {
        $input = $('<textarea></textarea>');
        $input.attr('rows',2);
      } else {
        $input = $('<input />');
        $input.attr('type','text');
      }
      $field.append($label).append($input);
      break;
    case 'calculate':
      $input = $('<input />');
      $input.attr('type','hidden');
      $field.append($input);
      break;
    case 'note':
      $input = $('<div></div>');
      $input.text(item.label);
      $field.append($input);
      break;
    default:
      $input = $('<input />');
      $input.attr('type','text');
      $field.append($label).append($input);
  }
  if (item.hint) {
    let $infoLink = $('<a href="#"></a>');
    $infoLink.addClass('info');
    $infoLink.attr('title',item.hint);
    $infoLink.html($('aside').html());
    $infoLink.appendTo($field);
  }
  $input.attr('id',item.name);
  $input.attr('name',item.name);
  return $field;
}
