import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DebugPanel: React.FC = () => {
  const [dbStatus, setDbStatus] = useState<string>('Checking...');
  const [tableInfo, setTableInfo] = useState<any[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const checkDatabase = async () => {
    try {
      if (!supabaseUrl || !supabaseKey) {
        setDbStatus('Missing Supabase credentials');
        return;
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Check connection
      const { data, error } = await supabase.from('crime_report').select('count(*)');
      
      if (error) {
        console.error('Debug panel error:', error);
        setDbStatus(`Connection error: ${error.message}`);
        return;
      }
      
      setDbStatus('Connected successfully');
      
      // Check for SQL function
      try {
        const { data: sqlFnData, error: sqlFnError } = await supabase.rpc('execute_sql', { 
          query: 'SELECT 1 as test' 
        });
        
        if (sqlFnError) {
          setTableInfo(prev => [...prev, { 
            name: 'execute_sql function', 
            status: `Error: ${sqlFnError.message}` 
          }]);
        } else {
          setTableInfo(prev => [...prev, { 
            name: 'execute_sql function', 
            status: 'Available',
            data: sqlFnData 
          }]);
        }
      } catch (err: any) {
        setTableInfo(prev => [...prev, { 
          name: 'execute_sql function', 
          status: `Exception: ${err.message}` 
        }]);
      }
      
      // Test a simple query
      try {
        const { data: reportsData, error: reportsError } = await supabase
          .from('crime_report')
          .select('*')
          .limit(1);
        
        if (reportsError) {
          setTableInfo(prev => [...prev, { 
            name: 'crime_report table', 
            status: `Error: ${reportsError.message}` 
          }]);
        } else {
          setTableInfo(prev => [...prev, { 
            name: 'crime_report table', 
            status: `${reportsData?.length || 0} records retrieved`, 
            data: reportsData 
          }]);
        }
      } catch (err: any) {
        setTableInfo(prev => [...prev, { 
          name: 'crime_report table', 
          status: `Exception: ${err.message}` 
        }]);
      }
      
    } catch (err: any) {
      setDbStatus(`Unexpected error: ${err.message}`);
    }
  };

  useEffect(() => {
    if (showDebug) {
      checkDatabase();
    }
  }, [showDebug]);

  if (!showDebug) {
    return (
      <Button 
        variant="outline" 
        className="fixed bottom-4 right-4 z-50 opacity-50 hover:opacity-100"
        onClick={() => setShowDebug(true)}
      >
        Debug
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-auto shadow-lg">
      <CardHeader className="py-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">Debug Panel</CardTitle>
          <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setShowDebug(false)}>
            X
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-xs">
          <div>
            <p className="font-semibold">Database Status:</p>
            <p>{dbStatus}</p>
          </div>
          
          <div>
            <p className="font-semibold">Supabase URL:</p>
            <p>{supabaseUrl ? 'Configured' : 'Missing'}</p>
          </div>
          
          <div>
            <p className="font-semibold">Supabase Key:</p>
            <p>{supabaseKey ? 'Configured' : 'Missing'}</p>
          </div>
          
          <div>
            <p className="font-semibold">Table Information:</p>
            {tableInfo.map((info, index) => (
              <div key={index} className="mt-2 border-t pt-2">
                <p><strong>{info.name}:</strong> {info.status}</p>
                {info.data && (
                  <pre className="mt-1 bg-black/10 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(info.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={checkDatabase}
          >
            Refresh Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugPanel; 