ARG VERSION_UBUNTU=latest
FROM ubuntu:$VERSION_UBUNTU
MAINTAINER Vivek Prajapati

#
#   Essential arguments
#
ARG VERSION_ASTERISK
ARG VERSION_MONGOC
ARG VERSION_LIBSRTP
ARG DATABASE_HOST
ARG DATABASE_NAME
ARG PUBLIC_IP
ARG CIDR
ENV DEBIAN_FRONTEND noninteractive


# SHELL ["/bin/bash", "-c"]

WORKDIR /root

RUN apt-get update \
&&  apt-get install -y \
    libssl-dev \
    libsasl2-dev \
    libncurses5-dev \
    libnewt-dev \
    libxml2-dev \
    libsqlite3-dev \
    libjansson-dev \
    libcurl4-openssl-dev \
    libedit-dev \
    pkg-config \
    build-essential \
    cmake \
    autoconf \
    uuid-dev \
    wget \
    file \
    git \
    vim \
    curl

RUN cd $HOME \
    &&  wget -nv "https://github.com/mongodb/mongo-c-driver/releases/download/$VERSION_MONGOC/mongo-c-driver-$VERSION_MONGOC.tar.gz" -O - | tar xzf - \
    &&  cd mongo-c-driver-$VERSION_MONGOC \
    &&  mkdir cmake-build \
    &&  cd cmake-build \
    &&  cmake -DENABLE_AUTOMATIC_INIT_AND_CLEANUP=OFF .. \
    &&  make all install > make.log \
    &&  make clean \
    &&  cd $HOME \
    &&  tar czf mongo-c-driver-$VERSION_MONGOC.tgz mongo-c-driver-$VERSION_MONGOC \
    &&  rm -rf mongo-c-driver-$VERSION_MONGOC

#
#   Build and install Asterisk with patches for ast_mongo
#
RUN cd $HOME
RUN wget "http://downloads.asterisk.org/pub/telephony/asterisk/releases/asterisk-16.0.0.tar.gz" -O - | tar -zxf -
RUN git clone https://github.com/vivek8690/ast_mongo.git \
    && ls -la \
    && pwd

RUN cd asterisk-$VERSION_ASTERISK \
    && pwd \
    &&  cd $HOME/asterisk-$VERSION_ASTERISK/cdr \
    &&  cp $HOME/ast_mongo/src/cdr_mongodb.c . \
    &&  cd $HOME/asterisk-$VERSION_ASTERISK/cel \
    &&  cp $HOME/ast_mongo/src/cel_mongodb.c . \
    &&  cd $HOME/asterisk-$VERSION_ASTERISK/res \
    &&  cp $HOME/ast_mongo/src/res_mongodb.c . \
    &&  cp $HOME/ast_mongo/src/res_mongodb.exports.in . \
    &&  cp $HOME/ast_mongo/src/res_config_mongodb.c . \
    &&  cd $HOME/asterisk-$VERSION_ASTERISK/include/asterisk \
    &&  cp $HOME/ast_mongo/src/res_mongodb.h .


RUN  cd $HOME/asterisk-$VERSION_ASTERISK && \
    patch -p1 -F3 -i $HOME/ast_mongo/src/mongodb.for.asterisk.patch && \
    yes | ./contrib/scripts/install_prereq install -y && \
    make clean && \
    ./bootstrap.sh && \
    ./configure CFLAGS="-march=native -mstackrealign -mfpmath=sse" --with-pjproject-bundled --with-jansson-bundled && \
    make menuselect.makeopts && \
    menuselect/menuselect --disable cdr_sqlite3_custom --disable BUILD_NATIVE menuselect.makeopts && \
    make && \
    make install && \
    ldconfig && \
    make && \
    make config && \
    make install-logrotate 
    
RUN cp $HOME/ast_mongo/test_bench/configs/* /etc/asterisk/

RUN echo "[general]\n\
        format=wav49|gsm|wav\n\
        servermail=asterisk\n\
        attach=yes\n\
        skipms=3000\n\
        maxsilence=10\n\
        silencethreshold=128\n\
        maxlogins=3\n\
        emaildateformat=%A %B %d, %Y at %r\n\
        pagerdateformat=%A, %B %d, %Y at %r\n\
        sendvoicemail=yes\n\
        [zonemessages]\n\
        eastern=America/New_York|'vm-received' Q 'digits/at' IMp\n\
        central=America/Chicago|'vm-received' Q 'digits/at' IMp\n\
        central24=America/Chicago|'vm-received' q 'digits/at' H N 'hours'\n\
        military=Zulu|?~@~Yvm-received' q 'digits/at' H N 'hours' 'phonetic/z_p'\n\
        european=Europe/Copenhagen|'vm-received' a d b 'digits/at' HM" > /etc/asterisk/voicemail.conf && \
    echo ";\n\
        ;   rtp.conf\n\
        ;\n\
        [general]\n\
        rtpstart=10000\n\
        rtpend=20000" > /etc/asterisk/rtp.conf && \
    echo "[general]\n\
        static=yes\n\
        writeprotect=yes\n\
        clearglobalvars=yes\n\
        autofallthrough=no\n\
        \n\
        [testing]\n\
        exten => _X.,1,Set(TRYCNT=0)\n\
        same => n,Set(__DYNAMIC_FEATURES=nway-start-caller#nway-start-callee)\n\
        same => n,Set(CALLTOEXT=\${EXTEN})\n\
        same => n,Set(CALLFROMEXT=\${CALLERID(num)})\n\
        same => n,Gotoif(\$[\${TRYCNT} >= 1]?wait:dial)\n\
        same => n(wait),Wait(1)\n\
        same => n(dial),Dial(PJSIP/\${EXTEN},20,tTrRg)\n\
        same => n,Gotoif(\$[\"\${JOIN_CONFERENCE}\" = \"yes\"]?confcall:simplecall)\n\
        same => n(confcall),Goto(\${CONFNO},1)\n\
        same => n(simplecall),Goto(s-\${DIALSTATUS},1)\n\
        same => n,Hangup()\n\
        \n\
        exten => _XXXXX,1,Noop()\n\
        same => n,Stasis(ari-test)\n\
        same => n,Hangup()\n\
        \n\
        exten => *0000,1,VoiceMailMain(\${CALLERID(num)})\n\
        same => n,Hangup()\n\
        \n\
        exten => _00X.,1,NoOp(conf)\n\
        same => n,ConfBridge(\${EXTEN},default_bridge,default_user)\n\
        \n\
        exten => _0X.,1,NoOp(conf)\n\
        same => n,Answer\n\
        same => n,Set(__DYNAMIC_FEATURES=nway-start#nway-ok)\n\
        same => n,Set(CONFNO=\${EXTEN})\n\
        same => n,ConfBridge(\${EXTEN},default_bridge,default_user,volume_ctrl_menu)\n\
        same => n,Hangup()\n\
        \n\
        exten => s-ANSWER,1,NoOp(answered)\n\
        same => n,Hangup()\n\
        \n\
        exten => s-CANCEL,1,NoOp(canceled)\n\
        same => n,Hangup()\n\
        \n\
        exten => s-INVALIDARGS,1,NoOp(invalidargs)\n\
        same => n,Hangup()\n\
        \n\
        exten => s-NOANSWER,1,Playback(number-not-answering)\n\
        same => n,voicemail(\${CALLTOEXT},u)\n\
        same => n,Hangup()\n\
        \n\
        exten => s-CONGESTION,1,Set(i=1)\n\
        same => n,While(\$[\${i} < 8])\n\
        same => n,Playback(beep)\n\
        same => n,Set(i=\$[\${i} + 1])\n\
        same => n,EndWhile\n\
        same => n,Hangup()\n\
        \n\
        exten => s-CHANUNAVAIL,1,Set(TRYCNT=\$[\${TRYCNT} + 1])\n\
        same => n,Playback(beeperr)\n\
        same => n,Gotoif(\$[\${TRYCNT} > 10]?cancel)\n\
        same => n,Gotoif(\$[\${TRYCNT} > 1]?goup)\n\
        same => n,Set(CURL_RESULT=\${CURL(http://localhost:3000/api/send-push-from-asterisk?callToExt=\${CALLTOEXT}&callFromExt=\${CALLFROMEXT})})\n\
        same => n,GotoIf(\$[\"\${CURL_RESULT}\" = \"true\"]?goup:cancel)\n\
        same => n(goup),GoTo(\${CALLTOEXT},2)\n\
        same => n(cancel),voicemail(\${CALLTOEXT},u)\n\
        same => n,Hangup()\n\
        \n\
        exten => s-BUSY,1,voicemail(\${CALLTOEXT},b)\n\
        same => n,hangup()\n\
        \n\
        [subNwaystart]\n\
        exten => start,1,Set(CONFNO=0\${CALLERID(num)})\n\
        same => n,Set(__DYNAMIC_FEATURES=nway-start-caller#nway-start-callee)\n\
        same => n,ChannelRedirect(\${BRIDGEPEER},testing,\${CONFNO},1)\n\
        same => n,Set(JOIN_CONFERENCE=yes)\n\
        same => n,Return()\n\
        \n\
        [subNwayinvite]\n\
        exten => s,1,Set(CONFINVITECNT=0)\n\
        same => n,Read(DEST,vm-enter-num-to-call,,i,1,5)\n\
        same => n,Set(CALLERNAME=\${CALLERID(name)})\n\
        same => n,Set(ISCONF=\${REGEX(\"Conference\" \${CALLERNAME})})\n\
        same => n,Gotoif(\$[\"\${ISCONF}\" = \"0\"]?setcallid:todial)\n\
        same => n(setcallid),Set(CALLERNAME=\${CALLERNAME} - Conference)\n\
        same => n,Set(CALLERID(name)=\${CALLERNAME})\n\
        same => n(todial),Wait(1)\n\
        same => n,Dial(PJSIP/\${DEST},20,tTrRg)\n\
        same => n,Set(CALLFROMEXT=\${CALLERID(num)})\n\
        same => n,Set(CALLTOEXT=\${DEST})\n\
        same => n,Goto(s-\${DIALSTATUS},1)\n\
        same => n,ChannelRedirect(\${DIALEDPEERNAME},testing,\${CONFNO},1)\n\
        \n\
        exten => s-ANSWER,1,NoOp(answered)\n\
        same => n,ChannelRedirect(\${DIALEDPEERNAME},testing,\${CONFNO},1)\n\
        \n\
        exten => s-CANCEL,1,NoOp(canceled)\n\
        same => n,ChannelRedirect(\${DIALEDPEERNAME},testing,\${CONFNO},1)\n\
        \n\
        exten => s-INVALIDARGS,1,NoOp(invalidargs)\n\
        same => n,ChannelRedirect(\${DIALEDPEERNAME},testing,\${CONFNO},1)\n\
        \n\
        exten => s-NOANSWER,1,Playback(number-not-answering)\n\
        same => n,Playback(please-try-call-later)\n\
        same => n,ChannelRedirect(\${DIALEDPEERNAME},testing,\${CONFNO},1)\n\
        \n\
        exten => s-CONGESTION,1,Set(i=1)\n\
        same => n,While(\$[\${i} < 8])\n\
        same => n,Playback(beep)\n\
        same => n,Set(i=\$[\${i} + 1])\n\
        same => n,EndWhile\n\
        same => n,ChannelRedirect(\${DIALEDPEERNAME},testing,\${CONFNO},1)\n\
        \n\
        exten => s-BUSY,1,Playback(number-not-answering)\n\
        same => n,Playback(please-try-call-later)\n\
        same => n,ChannelRedirect(\${DIALEDPEERNAME},testing,\${CONFNO},1)\n\
        \n\
        exten => s-CHANUNAVAIL,1,Set(CONFINVITECNT=\$[\${CONFINVITECNT} + 1])\n\
        same => n,Gotoif($[\${CONFINVITECNT} > 10]?cancel)\n\
        same => n,Gotoif($[\${CONFINVITECNT} > 1]?goup)\n\
        same => n,Set(CURL_RESULT=\${CURL(http://localhost:3000/api/send-push-from-asterisk?callToExt=\${CALLTOEXT}&callFromExt=\${CALLFROMEXT})})\n\
        same => n,GotoIf($[\"\${CURL_RESULT}\" = \"true\"]?goup:cancel)\n\
        same => n(goup),GoTo(s,4)\n\
        same => n,ChannelRedirect(\${DIALEDPEERNAME},testing,\${CONFNO},1)" > /etc/asterisk/extensions.conf && \
    echo " ;\n\
        ;   asterisk.conf\n\
        ;\n\
        [directories](!)\n\
        astetcdir => /etc/asterisk\n\
        astmoddir => /usr/lib/asterisk/modules\n\
        astvarlibdir => /var/lib/asterisk\n\
        astdbdir => /var/lib/asterisk\n\
        astkeydir => /var/lib/asterisk\n\
        astdatadir => /var/lib/asterisk\n\
        astagidir => /var/lib/asterisk/agi-bin\n\
        astspooldir => /var/spool/asterisk\n\
        astrundir => /var/run/asterisk\n\
        astlogdir => /var/log/asterisk\n\
        astsbindir => /usr/sbin\n\
        \n\
        [options]\n\
        timestamp = yes        ; Same as -T at startup.\n\
        dumpcore = yes         ; Dump core on crash (same as -g at startup).\n\
        autosystemname = yes   ; Automatically set systemname to hostname, uses 'localhost' on failure, or systemname if set" > /etc/asterisk/asterisk.conf && \
    echo    ";   modules.conf\n\
        ;\n\
        [modules]\n\
        ;\n\
        ; unload to disable annoying messages such as '*.conf not found'\n\
        ;\n\
        noload=>message.so\n\
        noload=>res_phoneprov.so\n\
        noload=>res_fax.so\n\
        noload=>res_calendar.so\n\
        noload=>res_config_ldap.so\n\
        noload=>res_config_sqlite3.so\n\
        noload=>res_clialiases.so\n\
        noload=>res_smdi.so\n\
        noload=>res_stun_monitor.so\n\
        noload=>res_pjsip_config_wizard.so\n\
        noload=>res_pjsip_phoneprov_provider.so\n\
        noload=>res_hep_pjsip.so\n\
        noload=>res_hep_rtcp.so\n\
        noload=>cdr_custom.so\n\
        noload=>cel_custom.so\n\
        noload=>pbx_dundi.so\n\
        noload=>pbx_ael.so\n\
        noload=>chan_phone.so\n\
        noload=>chan_unistim.so\n\
        noload=>chan_iax2.so\n\
        noload=>chan_mgcp.so\n\
        noload=>chan_skinny.so\n\
        noload=>chan_oss.so\n\
        noload=>app_amd.so\n\
        noload=>app_followme.so\n\
        noload=>app_festival.so\n\
        noload=>app_minivm.so\n\
        noload=>app_agent_pool.so\n\
        noload=>app_queue.so\n\
        \n\
        noload=>chan_sip.so\n\
        autoload=yes\n\
        preload => func_periodic_hook.so\n\
        preload => res_mongodb.so\n\
        preload => res_config_mongodb.so\n\
        preload => cdr_mongodb.so" > /etc/asterisk/modules.conf &&\
    echo "[transport-udp-nat]\n\
        type=tranport\n\
        protocol=udp\n\
        bind=0.0.0.0\n\
        external_media_address=127.0.0.1\n\
        external_signaling_address=127.0.0.1\n\
        \n\
        [transport-tcp-nat]\n\
        type=transport\n\
        protocol=udp\n\
        bind=0.0.0.0\n\
        local_net=172.31.32.0/20\n\
        external_media_address=$(curl ifconfig.me)\n\
        external_signaling_address=$(curl ifconfig.me)" > /etc/asterisk/pjsip.conf &&\
    echo "[common]\n\
        \n\
        [config]\n\
        uri=$DATABASE_HOST/$DATABASE_NAME?authSource=admin\n\
        \n\
        [cdr]\n\
        uri=$DATABASE_HOST/cdr?authSource=admin\n\
        database=cdr\n\
        collection=cdr\n\
        \n\
        [cel]\n\
        uri=$DATABASE_HOST/cel?authSource=admin\n\
        database=cel\n\
        collection=cel"> /etc/asterisk/ast_mongo.conf &&\
    echo "[settings]\n\
        ;ringgroups => mongodb,$DATABASE_NAME,ring_configs\n\
        ;dids => mongodb,$DATABASE_NAME,dids_configs\n\
        ps_endpoints => mongodb,$DATABASE_NAME\n\
        ps_auths => mongodb,$DATABASE_NAME\n\
        ps_aors => mongodb,$DATABASE_NAME\n\
        ps_contacts => mongodb,$DATABASE_NAME\n\
        ps_registrations => mongodb,$DATABASE_NAME\n\
        ;ps_endpoint_id_ips => mongodb,$DATABASE_NAME\n\
        ;voicemail => mongodb,$DATABASE_NAME,voicemail_users\n\
        ;extensions.conf => mongodb,$DATABASE_NAME,ast_configs\n\
        ;pjsip.conf => mongodb,$DATABASE_NAME,ast_configs\n\
        ;musiconhold.conf => mongodb,$DATABASE_NAME,ast_configs\n\
        ;confbridge.conf => mongodb,$DATABASE_NAME,ast_configs\n\
        ;voicemail.conf => mongodb,$DATABASE_NAME,ast_configs\n\
        ;features.conf => mongodb,$DATABASE_NAME,ast_configs"> /etc/asterisk/extconfig.conf &&\
    echo "[res_pjsip]\n\
        endpoint=realtime,ps_endpoints\n\
        auth=realtime,ps_auths\n\
        aor=realtime,ps_aors\n\
        contact=realtime,ps_contacts\n\
        [res_pjsip_endpoint_identifier_ip]\n\
        identify=realtime,ps_endpoint_id_ips\n\
        [res_pjsip_outbound_registration]\n\
        registration=realtime,ps_registrations" > /etc/asterisk/sorcery.conf &&\
    echo "[general]\n\
        exce_after_rotate=gzip -9 ${filename}.2;\n\
        dateformat = %F %T\n\
        rotatestrategy = rotate\n\
        \n\
        [logfiles]\n\
        security => security\n\
        console => notice,warning,error\n\
        messages => notice,warning,error" > /etc/asterisk/logger.conf &&\
    echo "[general]\n\
        transferdigittimeout => 20\n\
        \n\
        [featuremap]\n\
        blindxfer => #1\n\
        atxfer => *2\n\
        parkcall => #72\n\
        \n\
        [applicationmap]\n\
        nway-start-caller => *0,self/caller,Gosub(subNwaystart,start,1)\n\
        nway-start-callee => *1,peer/callee,Gosub(subNwaystart,start,1)" > /etc/asterisk/features.conf && \
    echo "[general]\n\
        [default_user]\n\
        type=user\n\
        [default_bridge]\n\
        type=bridge\n\
        sound_only_person=conf-userswilljoin\n\
        sound_kicked=silence/1\n\
        sound_only_person=silence/1\n\
        [volume_ctrl_menu]\n\
        type=menu\n\
        *0=dialplan_exec(subNwayinvite,s,1)\n\
        *1=dialplan_exec(subNwayinvite,s,1)" > /etc/asterisk/confbridge.conf && \
    echo "[general]\n\
        ;enabled = yes ; When set to yes, statsd support is enabled \n\
        ;server = 127.0.0.1	; server[:port] of statsd server to use. \n\
        ;prefix =			; Prefix to prepend to all metrics \n\
        ;add_newline = no" > /etc/asterisk/statsd.conf && \
    echo "[default]\n\
        mode=files\n\
        directory=/var/lib/asterisk/moh\n\
        random=yes" > /etc/asterisk/musiconhold.conf


ENTRYPOINT ["asterisk", "-c"]