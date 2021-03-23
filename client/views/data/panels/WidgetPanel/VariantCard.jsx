import React from 'react';
import moment from 'moment';
// import Pref from '/client/global/pref.js';

import CreateTag from '/client/components/tinyUi/CreateTag';
import TagsModule from '/client/components/bigUi/TagsModule';
import NotesModule from '/client/components/bigUi/NotesModule';

import VariantForm from '/client/components/forms/VariantForm';
import VariantLive from '/client/components/forms/VariantLive';
import Remove from '/client/components/forms/Remove';

import AssemblyList from './AssemblyList';

const VariantCard = ({ 
  variantData, widgetData, 
  groupData, batchRelated, 
  app, user
})=> {
  
  const v = variantData;
  
  const calString = "ddd, MMM D /YY, h:mm A";
  const calFunc = (d)=> moment(d).calendar(null, {sameElse: calString});

  return(
    <div className='min350 max400'>
      <div className='comfort'>
        
        <div className='wordBr vmarginhalf middle'>
          <span className='gap'>
            <VariantLive
              vId={v._id}
              vKey={v.versionKey}
              vState={v.live}
              noText={false}
              primeTopRight={false} />
          </span>
          <span className='big gap'>{v.variant}</span>
        </div>
      
        <div className='centreRow vmarginhalf'>
          
          <VariantForm
            widgetData={widgetData}
            variantData={variantData}
            app={app}
            rootWI={variantData.instruct}
            lockOut={groupData.hibernate} />

          <Remove
            action='variant'
            title={variantData.variant}
            check={variantData.createdAt.toISOString()}
            entry={variantData}
            lockOut={variantData.live === true} />
            
        </div>
          
      </div>
      
      <div className='vmarginhalf'>
        
        <span className='min200'>   
          
          <TagsModule
            action='variant'
            id={v._id}
            tags={v.tags}
            vKey={v.versionKey}
            tagOps={app.tagOption} />
          
          <p className='numFont'>default units: {v.runUnits}</p>
          
          <p>
            <a 
              className='clean wordBr' 
              href={v.instruct} 
              target='_blank'
            >{v.instruct}</a>
          </p>
        
          <NotesModule
            sourceId={v._id}
            noteObj={v.notes}
            editMethod='setVariantNote'
            cal={calFunc} />
            
          <AssemblyList
            variantData={variantData}
            widgetData={widgetData}
            groupData={groupData} />
        
          <CreateTag
            when={v.createdAt}
            who={v.createdWho}
            whenNew={v.updatedAt}
            whoNew={v.updatedWho}
            dbKey={v.versionKey} />
        </span>
      </div>
    </div>
  );
};

export default VariantCard;

/*
  totalI(mData) {
    let items = Array.from(mData.batchInfo, x => x.items);
    let quantities = Array.from(mData.batchInfoX, x => x.quantity);
    let total = items.length > 0 ? items.reduce((x,y)=>x+y) : 0;
    let totalX = quantities.length > 0 ? quantities.reduce((x,y)=>x+y) : 0;
    return total + totalX;
  }
  */
  
  /*
  avgNC(mData) {
    let items = Array.from(mData.batchInfo, x => x.items);
    let quantities = Array.from(mData.batchInfoX, x => x.quantity);
    let total = items.length > 0 ? items.reduce((x,y)=>x+y) : 0;
    let totalX = quantities.length > 0 ? quantities.reduce((x,y)=>x+y) : 0;
    
    let ncs = Array.from(mData.batchInfo, x => x.nonCons);
    let ncsX = Array.from(mData.batchInfoX, x => x.nonCons);
    
    let allNCs = ncs.length > 0 ? ncs.reduce((x,y)=>x+y) : 0;
    let allNCsX = ncsX.length > 0 ? ncsX.reduce((x,y)=>x+y) : 0;
    
    let perI = (allNCs / ( total > 0 ? total : 1));
    let perIX = (allNCsX / ( totalX > 0 ? totalX : 1) );
    const perItem = ( perI + perIX ).toFixed(1);
    
    let perW = (allNCs / (ncs.length > 0 ? ncs.length : 1) );
    let perWX = (allNCsX / (ncsX.length > 0 ? ncsX.length : 1) );
    const perWOrder = ( perW + perWX ).toFixed(1);
    
    return { perItem, perWOrder };
  }
  */