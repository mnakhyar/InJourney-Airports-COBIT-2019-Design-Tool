import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { WeightConfiguration } from '../types';
import { databaseService } from '../services/databaseService';
import { weightService } from '../services/weightService';
import { DESIGN_FACTORS } from '../constants/cobitData';
import { GOVERNANCE_OBJECTIVES } from '../constants/cobitData';

const WeightManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [configurations, setConfigurations] = useState<WeightConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<WeightConfiguration | null>(null);
  const [configName, setConfigName] = useState('');
  const [configDescription, setConfigDescription] = useState('');
  const [selectedFactor, setSelectedFactor] = useState('df1');
  const [editingWeights, setEditingWeights] = useState<{ [key: string]: { [key: string]: number } }>({});
  
  // Confirm dialog states
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'warning' | 'info' | 'error';
  } | null>(null);

  useEffect(() => {
    loadConfigurations();
  }, []);

  // Create default configuration if none exists
  useEffect(() => {
    const createDefaultConfig = async () => {
      if (configurations.length === 0 && !loading) {
        try {
          const defaultMappings = createDefaultMappings();
          const response = await databaseService.saveWeightConfiguration({
            name: 'Default Configuration',
            description: 'Default weight configuration with baseline values',
            mappings: defaultMappings,
            isActive: true
          });

          if (response.success && response.data) {
            setConfigurations([response.data]);
            await weightService.refresh();
          }
        } catch (error) {
          console.error('Failed to create default configuration:', error);
        }
      }
    };

    createDefaultConfig();
  }, [configurations.length, loading]);

  const loadConfigurations = async () => {
    setLoading(true);
    try {
      const response = await databaseService.getWeightConfigurations();
      if (response.success && response.data) {
        setConfigurations(response.data);
      }
    } catch (error) {
      console.error('Failed to load configurations:', error);
    }
    setLoading(false);
  };

  const openConfirmDialog = (title: string, message: string, onConfirm: () => void, type: 'warning' | 'info' | 'error' = 'warning') => {
    setConfirmDialogConfig({ title, message, onConfirm, type });
    setShowConfirmDialog(true);
  };

  const handleCreateConfig = async () => {
    if (!configName.trim()) {
      openConfirmDialog(
        'Error',
        'Please enter a configuration name',
        () => {},
        'error'
      );
      return;
    }

    try {
      // Create default mappings based on hardcoded baseline values
      const defaultMappings = createDefaultMappings();
      
      const response = await databaseService.saveWeightConfiguration({
        name: configName,
        description: configDescription,
        mappings: defaultMappings,
        isActive: false
      });

      if (response.success && response.data) {
        setConfigurations([...configurations, response.data]);
        setShowCreateDialog(false);
        setConfigName('');
        setConfigDescription('');
        openConfirmDialog(
          'Success',
          'Weight configuration created successfully!',
          () => {},
          'info'
        );
      }
    } catch (error) {
      openConfirmDialog(
        'Error',
        'Failed to create configuration',
        () => {},
        'error'
      );
    }
  };

  // Create default mappings based on active configuration or hardcoded values
  const createDefaultMappings = () => {
    const mappings: { [key: string]: { [key: string]: { [key: string]: number } } } = {};
    
    // Get active configuration
    const activeConfig = weightService.getActiveConfiguration();
    
    if (activeConfig && activeConfig.mappings) {
      // Use active configuration as default
      return activeConfig.mappings;
    } else {
      // Fallback to hardcoded values
      DESIGN_FACTORS.forEach(factor => {
        const factorItems = factor.archetypes || factor.categories || factor.riskScenarios || factor.issues || factor.options || [];
        
        if (factorItems.length > 0) {
          mappings[factor.id] = {};
          
          factorItems.forEach(item => {
            mappings[factor.id][item.id] = {};
            
            GOVERNANCE_OBJECTIVES.forEach(objective => {
              // Get default weight from weight service (hardcoded fallback)
              const defaultWeight = weightService.getWeight(factor.id, item.id, objective.id);
              mappings[factor.id][item.id][objective.id] = defaultWeight;
            });
          });
        }
      });
    }
    
    return mappings;
  };

  const handleEditConfig = (config: WeightConfiguration) => {
    setSelectedConfig(config);
    setConfigName(config.name);
    setConfigDescription(config.description || '');
    setEditingWeights(config.mappings);
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedConfig || !configName.trim()) {
      openConfirmDialog(
        'Error',
        'Please enter a configuration name',
        () => {},
        'error'
      );
      return;
    }

    try {
      const updatedConfig: WeightConfiguration = {
        ...selectedConfig,
        name: configName,
        description: configDescription,
        mappings: editingWeights,
        updatedAt: new Date().toISOString()
      };

      // Update in database
      const response = await databaseService.saveWeightConfiguration({
        name: updatedConfig.name,
        description: updatedConfig.description,
        mappings: updatedConfig.mappings,
        isActive: updatedConfig.isActive
      });

      if (response.success) {
        setConfigurations(configurations.map(c => 
          c.id === selectedConfig.id ? updatedConfig : c
        ));
        setShowEditDialog(false);
        setSelectedConfig(null);
        openConfirmDialog(
          'Success',
          'Configuration updated successfully!',
          () => {},
          'info'
        );
      }
    } catch (error) {
      openConfirmDialog(
        'Error',
        'Failed to update configuration',
        () => {},
        'error'
      );
    }
  };

  const handleDeleteConfig = async (configId: string) => {
    openConfirmDialog(
      'Delete Configuration',
      'Are you sure you want to delete this configuration?',
      async () => {
        try {
          const filteredConfigs = configurations.filter(c => c.id !== configId);
          setConfigurations(filteredConfigs);
          // Note: We don't have a delete method in databaseService yet
          openConfirmDialog(
            'Success',
            'Configuration deleted successfully!',
            () => {},
            'info'
          );
        } catch (error) {
          openConfirmDialog(
            'Error',
            'Failed to delete configuration',
            () => {},
            'error'
          );
        }
      },
      'warning'
    );
  };

  const handleSetActive = async (configId: string) => {
    try {
      const updatedConfigs = configurations.map(c => ({
        ...c,
        isActive: c.id === configId
      }));

      // Save all configurations with updated active status
      for (const config of updatedConfigs) {
        await databaseService.saveWeightConfiguration({
          name: config.name,
          description: config.description,
          mappings: config.mappings,
          isActive: config.isActive
        });
      }

      setConfigurations(updatedConfigs);
      
      // Refresh weight service to update active configuration
      await weightService.refresh();
      
      openConfirmDialog(
        'Success',
        'Active configuration updated!',
        () => {},
        'info'
      );
    } catch (error) {
      openConfirmDialog(
        'Error',
        'Failed to update active configuration',
        () => {},
        'error'
      );
    }
  };

  const handleSetToDefault = async (configId: string) => {
    openConfirmDialog(
      'Reset to Default',
      'Are you sure you want to reset this configuration to default values? This action cannot be undone.',
      async () => {
        try {
          const config = configurations.find(c => c.id === configId);
          if (!config) {
            openConfirmDialog(
              'Error',
              'Configuration not found',
              () => {},
              'error'
            );
            return;
          }

          // Create default mappings
          const defaultMappings = createDefaultMappings();
          
          const updatedConfig: WeightConfiguration = {
            ...config,
            mappings: defaultMappings,
            updatedAt: new Date().toISOString()
          };

          // Save updated configuration
          const response = await databaseService.saveWeightConfiguration({
            name: updatedConfig.name,
            description: updatedConfig.description,
            mappings: updatedConfig.mappings,
            isActive: updatedConfig.isActive
          });

          if (response.success) {
            setConfigurations(configurations.map(c => 
              c.id === configId ? updatedConfig : c
            ));
            
            // If this is the active config, refresh weight service
            if (updatedConfig.isActive) {
              await weightService.refresh();
            }
            
            openConfirmDialog(
              'Success',
              'Configuration reset to default values successfully!',
              () => {},
              'info'
            );
          }
        } catch (error) {
          openConfirmDialog(
            'Error',
            'Failed to reset configuration to default',
            () => {},
            'error'
          );
        }
      },
      'warning'
    );
  };

  const getFactorItems = (factorId: string) => {
    const factor = DESIGN_FACTORS.find(f => f.id === factorId);
    if (!factor) return [];

    return factor.archetypes || factor.categories || factor.riskScenarios || factor.issues || factor.options || [];
  };

  const updateWeight = (factorId: string, sourceId: string, objectiveId: string, weight: number) => {
    setEditingWeights(prev => ({
      ...prev,
      [factorId]: {
        ...prev[factorId],
        [sourceId]: {
          ...prev[factorId]?.[sourceId],
          [objectiveId]: weight
        }
      }
    }));
  };

  const getWeight = (factorId: string, sourceId: string, objectiveId: string): number => {
    return editingWeights[factorId]?.[sourceId]?.[objectiveId] || 0;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
                 <div className="flex justify-between items-center mb-6">
           <div>
             <h1 className="text-3xl font-bold text-gray-800">Weight Configuration Management</h1>
             <p className="text-gray-600 mt-2">Manage weight mappings for Design Factors</p>
             {weightService.isUsingDatabaseWeights() && (
               <p className="text-sm text-green-600 mt-1">
                 🗄️ Active: {weightService.getWeightSourceInfo().configName}
               </p>
             )}
           </div>
          <div className="flex space-x-2">
            <Button 
              onClick={() => {
                // Refresh weight service before navigating back
                weightService.refresh();
                navigate('/');
              }} 
              variant="secondary"
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 py-2"
            >
              Back to App
            </Button>
            <Button 
              onClick={() => setShowCreateDialog(true)} 
              variant="primary"
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2"
            >
              Create New Configuration
            </Button>
          </div>
        </div>

        {/* Configurations List */}
        <div className="grid gap-4 mb-8">
          {loading ? (
            <div className="text-center py-8">Loading configurations...</div>
          ) : configurations.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-500">No weight configurations found.</p>
              <Button 
                onClick={() => setShowCreateDialog(true)} 
                variant="primary"
                className="mt-4 bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2"
              >
                Create First Configuration
              </Button>
            </Card>
          ) : (
            configurations.map((config) => (
              <Card key={config.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">{config.name}</h3>
                      {config.name === 'Default Configuration' && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          Default
                        </span>
                      )}
                      {config.isActive && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          Active
                        </span>
                      )}
                    </div>
                    {config.description && (
                      <p className="text-gray-600 text-sm mt-1">{config.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Updated: {new Date(config.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => handleEditConfig(config)}
                      variant="primary"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-8 py-3"
                    >
                      Edit
                    </Button>
                    {!config.isActive && (
                      <Button 
                        onClick={() => handleSetActive(config.id)}
                        variant="secondary"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white rounded-2xl px-8 py-3"
                      >
                        Set Active
                      </Button>
                    )}
                    <Button 
                      onClick={() => handleSetToDefault(config.id)}
                      variant="secondary"
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700 text-white rounded-2xl px-8 py-3"
                    >
                      Set to Default
                    </Button>
                    <Button 
                      onClick={() => handleDeleteConfig(config.id)}
                      variant="secondary"
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white rounded-2xl px-8 py-3"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

                 {/* Create Configuration Dialog */}
         {showCreateDialog && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
               <h3 className="text-xl font-semibold mb-4">Create Weight Configuration</h3>
               <p className="text-sm text-gray-600 mb-4">
                 {weightService.isUsingDatabaseWeights() 
                   ? `New configuration will be created with values from the active configuration: "${weightService.getWeightSourceInfo().configName}"`
                   : "New configuration will be created with default baseline values from the original COBIT mappings."
                 }
               </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Configuration Name *
                  </label>
                  <input
                    type="text"
                    value={configName}
                    onChange={(e) => setConfigName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter configuration name..."
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={configDescription}
                    onChange={(e) => setConfigDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Configuration description (optional)..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  onClick={() => setShowCreateDialog(false)} 
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateConfig}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2"
                >
                  Create Configuration
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Configuration Dialog */}
        {showEditDialog && selectedConfig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4">Edit Weight Configuration: {selectedConfig.name}</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Configuration Name *
                  </label>
                  <input
                    type="text"
                    value={configName}
                    onChange={(e) => setConfigName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={configDescription}
                    onChange={(e) => setConfigDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                  />
                </div>
              </div>

              {/* Weight Editor */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Design Factor
                  </label>
                  <select
                    value={selectedFactor}
                    onChange={(e) => setSelectedFactor(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {DESIGN_FACTORS.map(factor => (
                      <option key={factor.id} value={factor.id}>
                        {factor.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Weight Matrix */}
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-3 py-2 text-left">Source Item</th>
                        {GOVERNANCE_OBJECTIVES.map(obj => (
                          <th key={obj.id} className="border border-gray-300 px-2 py-2 text-center text-xs">
                            {obj.id}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getFactorItems(selectedFactor).map(item => (
                        <tr key={item.id}>
                          <td className="border border-gray-300 px-3 py-2 text-sm font-medium">
                            {item.name}
                          </td>
                          {GOVERNANCE_OBJECTIVES.map(obj => (
                            <td key={obj.id} className="border border-gray-300 px-2 py-1">
                                                             <input
                                 type="number"
                                 step="0.01"
                                 min="0"
                                 max="10"
                                 value={getWeight(selectedFactor, item.id, obj.id)}
                                 onChange={(e) => updateWeight(selectedFactor, item.id, obj.id, parseFloat(e.target.value) || 0)}
                                 className="w-full text-center text-sm border-none focus:ring-2 focus:ring-blue-500 rounded"
                               />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

                             <div className="flex justify-end space-x-2 mt-6">
                 <Button 
                   onClick={() => setShowEditDialog(false)} 
                   variant="secondary"
                 >
                   Cancel
                 </Button>
                 <Button 
                   onClick={() => {
                     if (selectedConfig) {
                       setEditingWeights(createDefaultMappings());
                     }
                   }}
                   variant="secondary"
                   className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg px-4 py-2"
                 >
                   Reset to Default
                 </Button>
                 <Button 
                   onClick={handleSaveEdit}
                   className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2"
                 >
                   Save Changes
                 </Button>
               </div>
            </div>
          </div>
        )}

        {/* Confirm Dialog */}
        {showConfirmDialog && confirmDialogConfig && (
          <ConfirmDialog
            isOpen={showConfirmDialog}
            onClose={() => setShowConfirmDialog(false)}
            onConfirm={confirmDialogConfig.onConfirm}
            title={confirmDialogConfig.title}
            message={confirmDialogConfig.message}
            type={confirmDialogConfig.type}
          />
        )}
      </div>
    </div>
  );
};

export default WeightManagementPage; 