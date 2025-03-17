module.exports = {
  'humhub-module': `<?php

namespace humhub\\modules\\${1:moduleName};

use Yii;
use yii\\helpers\\Url;

/**
 * ${2:ModuleClass} defines the configuration and behavior of the ${1:moduleName} module.
 */
class Module extends \\humhub\\components\\Module
{
    /**
     * @inheritdoc
     */
    public $resourcesPath = 'resources';

    /**
     * @inheritdoc
     */
    public function init()
    {
        parent::init();

        // Custom initialization code goes here
    }

    /**
     * @inheritdoc
     */
    public function getConfigUrl()
    {
        return Url::to(['/admin/module/config', 'id' => $this->id]);
    }

    /**
     * @inheritdoc
     */
    public function disable()
    {
        // Cleanup all module data before disable the module
        // $this->uninstallContent();
        
        parent::disable();
    }
    
    /**
     * @inheritdoc
     */
    public function getPermissions($contentContainer = null)
    {
        if ($contentContainer) {
            return [
                new permissions\\${3:ViewContent}($contentContainer),
            ];
        }

        return [];
    }
}`,

  'humhub-widget': `<?php

namespace humhub\\modules\\${1:moduleName}\\widgets;

use Yii;
use humhub\\libs\\Html;
use humhub\\components\\Widget;

/**
 * Widget for rendering ${2:widgetDescription}
 */
class ${3:WidgetName} extends Widget
{
    /**
     * @var object the content object
     */
    public $content;

    /**
     * @var boolean show title
     */
    public $showTitle = true;

    /**
     * @inheritdoc
     */
    public function run()
    {
        return $this->render('${4:viewName}', [
            'content' => $this->content,
            'showTitle' => $this->showTitle
        ]);
    }
}`,

  'humhub-activity': `<?php

namespace humhub\\modules\\${1:moduleName}\\activities;

use Yii;
use humhub\\modules\\activity\\components\\BaseActivity;
use humhub\\modules\\activity\\interfaces\\ConfigurableActivityInterface;

/**
 * Activity for ${2:activityDescription}
 */
class ${3:ActivityName} extends BaseActivity implements ConfigurableActivityInterface
{
    /**
     * @inheritdoc
     */
    public $moduleId = '${1:moduleName}';

    /**
     * @inheritdoc
     */
    public $viewName = '${4:viewName}';

    /**
     * @inheritdoc
     */
    public function getTitle()
    {
        return Yii::t('${1:moduleName}Module.base', '${5:Activity Title}');
    }

    /**
     * @inheritdoc
     */
    public function getDescription()
    {
        return Yii::t('${1:moduleName}Module.base', '${6:Activity Description}');
    }

    /**
     * @inheritdoc
     */
    public function getUrl()
    {
        return $this->source->getUrl();
    }
}`,

  'humhub-controller': `<?php

namespace humhub\\modules\\${1:moduleName}\\controllers;

use Yii;
use humhub\\components\\Controller;
use humhub\\modules\\content\\components\\ContentContainerController;
use humhub\\modules\\${1:moduleName}\\models\\${2:ModelName};

/**
 * ${3:ControllerName} handles the ${4:description} requests for the ${1:moduleName} module
 */
class ${3:ControllerName} extends ContentContainerController
{
    /**
     * @inheritdoc
     */
    public function behaviors()
    {
        return [
            'acl' => [
                'class' => \\humhub\\components\\behaviors\\AccessControl::class,
                'rules' => [
                    [
                        'allow' => true,
                        'permissions' => [\\humhub\\modules\\${1:moduleName}\\permissions\\${5:Permission}::class]
                    ]
                ]
            ]
        ];
    }

    /**
     * Index action
     */
    public function actionIndex()
    {
        return $this->render('index', [
            'contentContainer' => $this->contentContainer
        ]);
    }

    /**
     * Action to create a new ${2:ModelName}
     */
    public function actionCreate()
    {
        $model = new ${2:ModelName}();
        $model->content->container = $this->contentContainer;

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            $this->view->success(Yii::t('${1:moduleName}Module.base', 'Successfully created!'));
            return $this->redirect(['index', 'contentContainer' => $this->contentContainer]);
        }

        return $this->render('create', [
            'model' => $model,
            'contentContainer' => $this->contentContainer
        ]);
    }
}`,

  'humhub-stream': `<?php

namespace humhub\\modules\\${1:moduleName}\\stream;

use Yii;
use humhub\\modules\\content\\components\\ContentContainerStream;
use humhub\\modules\\content\\models\\Content;
use humhub\\modules\\${1:moduleName}\\models\\${2:ModelName};

/**
 * Stream Action for ${2:ModelName}
 */
class ${2:ModelName}StreamAction extends ContentContainerStream
{
    /**
     * @inheritdoc
     */
    protected function setupFilters()
    {
        parent::setupFilters();

        $this->activeQuery->andWhere(['content.object_model' => ${2:ModelName}::class]);
    }

    /**
     * @inheritdoc
     */
    protected function getContentQuery()
    {
        $query = parent::getContentQuery();
        $query->andWhere(['content.object_model' => ${2:ModelName}::class]);
        
        return $query;
    }

    /**
     * @inheritdoc
     */
    public function setupCriteria()
    {
        parent::setupCriteria();
        
        // Add custom criteria here
    }
    
    /**
     * @inheritdoc
     */
    public function afterAction($action, $result)
    {
        $result = parent::afterAction($action, $result);
        
        // Modify the result if needed
        
        return $result;
    }
}`
};
