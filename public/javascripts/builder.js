$(document).ready(function() {
  $.getJSON( "/javascripts/fields.json", function( data ) {
    var $group = null, $repeat = null;
    data.survey.forEach(item => {
      
      if (item.type.includes('repeat')) {
        if (item.type.includes('begin')) {
          $repeat = $('<section></section>');
          $repeat.addClass('repeat');
          $repeat.attr('data-repeat',item.name);
          $repeat.attr('data-instance',1);
          if (item.relevance) $repeat.attr('data-relevance',item.relevance);
          $repLabel = $('<h3></h3>');
          $repLabel.text(item.label);
          $repLabel.append(` (Repeat Instance 1)`);
          $repLabel.appendTo($repeat);
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
    $('.add-repeat').click(function() {
      let $parent = $(this).parent('.repeat');
      let $newInstance = parseInt($parent.attr('data-instance')) + 1;
      let $newRepeat = $parent.clone();
      $newRepeat.attr('data-instance',$newInstance);
      $parent.after($newRepeat);
      $(this).hide();
      $parent.find('.remove-repeat').show();
      $newRepeat.find('.remove-repeat').show();
      $newRepeat.find('.add-repeat').click(function() {
        let $parent = $(this).parent('.repeat');
        let $newInstance = $parent.attr('data-instance') + 1;
        let $newRepeat = $parent.clone();
        $newRepeat.attr('data-instance',$newInstance);
        $parent.after($newRepeat);
        $(this).hide();
        $newRepeat.find('.remove-repeat').show();
      });
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
        $(this).find('h3').append(` (Repeat Instance ${inst})`);
      });
    });
    $('[data-meta]').add('[data-type="calculate"]').hide();

    formSpecifics();
  });
});
function formSpecifics() {
  $('[data-repeat="return_order_rpt"]').hide();
  $('[data-repeat="add_del_rpt"]').hide();
  $('[data-repeat="ret_del_rpt"]').hide();
  $('[data-repeat="ret_add_del_rpt"]').hide();
  $('[data-repeat="rep_rpt"]').hide();
  $('[data-repeat="ret_rep_del_rpt"]').hide();
  $('#order_add').change(function() {
    console.log('Change');
    $(this).find('option').each(function() {
      let sect = $(this).val();
      console.log(sect,$(this + ':selected'));
      ($(this + ':selected')) ? $(`[data-repeat="${sect}"]`).show() : $(`[data-repeat="${sect}"]`).hide();
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
