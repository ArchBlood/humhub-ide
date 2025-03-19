/**
 * HumHub Code Snippets
 * This file contains commonly used code snippets for HumHub development
 */

module.exports = {
  // PHP Snippets
  'controller': `<?php

namespace humhub\\modules\\modulename\\controllers;

use Yii;
use humhub\\components\\Controller;

class DefaultController extends Controller
{
    public function actionIndex()
    {
        return $this->render('index');
    }
}`,

  'model': `<?php

namespace humhub\\modules\\modulename\\models;

use Yii;
use yii\\base\\Model;

class SampleModel extends Model
{
    public $property1;
    public $property2;

    public function rules()
    {
        return [
            [['property1', 'property2'], 'required'],
        ];
    }
}`,

  'widget': `<?php

namespace humhub\\modules\\modulename\\widgets;

use yii\\base\\Widget;

class SampleWidget extends Widget
{
    public $param;

    public function run()
    {
        return $this->render('sampleWidget', [
            'param' => $this->param
        ]);
    }
}`,

  'migration': `<?php

use humhub\\components\\Migration;

class m000000_000000_initial extends Migration
{
    public function up()
    {
        $this->createTable('{{%tablename}}', [
            'id' => $this->primaryKey(),
            'name' => $this->string(100)->notNull(),
            'description' => $this->text()->null(),
            'created_at' => $this->dateTime()->notNull(),
            'created_by' => $this->integer()->notNull(),
            'updated_at' => $this->dateTime()->notNull(),
            'updated_by' => $this->integer()->notNull(),
        ]);

        $this->addForeignKey('fk_tablename_created_by', '{{%tablename}}', 'created_by', '{{%user}}', 'id', 'CASCADE');
        $this->addForeignKey('fk_tablename_updated_by', '{{%tablename}}', 'updated_by', '{{%user}}', 'id', 'CASCADE');
    }

    public function down()
    {
        $this->dropTable('{{%tablename}}');
    }
}`,

  // JavaScript Snippets
  'client-module': `humhub.module('modulename', function(module, require, $) {
    const client = require('client');
    const modal = require('ui.modal');

    module.initOnPjaxLoad = true;

    module.init = function() {
        console.log('Module initialized');
        // Your initialization code here
    };

    module.myFunction = function() {
        // Function implementation
    };

    // Initialize module on document load
    module.export({
        init: module.init,
        myFunction: module.myFunction
    });
});`,

  'humhub-event': `// Register for HumHub event
document.addEventListener('humhub:ready', function() {
    // Your code to execute when HumHub is ready
    console.log('HumHub is ready');
});

// Trigger custom event
humhub.event.trigger('custom-event', {
    data: 'value'
});`,

  // View Templates
  'view-template': `<?php
/**
 * @var $this yii\\web\\View
 */

use humhub\\widgets\\Button;
use yii\\helpers\\Html;
use yii\\helpers\\Url;

$this->title = 'Page Title';
?>

<div class="panel panel-default">
    <div class="panel-heading">
        <?= Html::encode($this->title) ?>
    </div>
    <div class="panel-body">
        <!-- Your content here -->
        <?= Button::primary('Submit')->action('submit')->submit() ?>
    </div>
</div>`,

  // Event Handlers
  'event-handler': `<?php

namespace humhub\\modules\\modulename\\config;

use humhub\\modules\\modulename\\Events;
use humhub\\modules\\admin\\widgets\\AdminMenu;
use humhub\\widgets\\TopMenu;

return [
    'id' => 'modulename',
    'class' => 'humhub\\modules\\modulename\\Module',
    'namespace' => 'humhub\\modules\\modulename',
    'events' => [
        [
            'class' => TopMenu::class,
            'event' => TopMenu::EVENT_INIT,
            'callback' => [Events::class, 'onTopMenuInit']
        ],
        [
            'class' => AdminMenu::class,
            'event' => AdminMenu::EVENT_INIT,
            'callback' => [Events::class, 'onAdminMenuInit']
        ],
    ]
];`
};
