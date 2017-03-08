Multi-Tenant Munki (ALPHA!)
===========================

This is a collection of PHP scripts and apache rewrite tricks to have
one server serve out a federated set of Munki repositories.  This is alpha at best and should not be used in a production environment.

A solution for:
---
How does one share out the benifits of being on a centralized munki 
service to departments -- both those with few mac-knowledgeable ITPros (and potentially more macs
than they're aware of) AND larger, more veteran departments that could 
roll their own but see the benefits of collaboration:

* Centrally managed, vetted & mainted software & patch repository -- Jenkins running AutoPkg (VirusTotal) & vetted by humans
* maintain individual department/unit repositories as well as full control of that space to the local ITPro
* insulate the individual repositories from impacts by other federated admins
* secure the system from some of the best up-and-comming software engineers in the world... that happen to exist INside our firewall
* Not interfere with the typical munki client operation so that future munki/munkireport releases are compatible.

"Help! My Dean Just Bought a Mac!" – Multi Tenant Munki @ The University of Illinois
https://www.youtube.com/watch?v=KyoSM3dvhHs
